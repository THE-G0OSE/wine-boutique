import "reflect-metadata";
import { Body, Controller, Get, HttpCode, Module, Post, Query } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { loadConfig, baseConfigSchema } from "../config/config.js";
import { ServiceKitModule } from "../service-kit.module.js";
import { ContractResponse } from "./contract-response.decorator.js";
import { RateLimit } from "./rate-limit.js";
import { ValidationError } from "./validation-error.js";
import { createTestApp } from "../testing.js";

const Item = z.object({ id: z.string(), name: z.string() });
const NewItem = z.object({ name: z.string().min(2) });
// Как в сгенерированных схемах контракта: z.int() без coerce — строку приводит пайп
const ListQuery = z.object({ limit: z.int().min(1).max(10).optional().default(1), slug: z.string().optional() });

@Controller("items")
class ItemsController {
  @Get()
  // Схема-массив, как в контракте (zGetGrapesResponse) — декоратор разворачивает её до элемента
  @ContractResponse(z.array(Item))
  list(@Query({ schema: ListQuery }) query: z.infer<typeof ListQuery>) {
    // Лишнее поле secret должно отрезаться схемой ответа
    return Array.from({ length: query.limit }, (_, i) => ({ id: `${i}`, name: query.slug ?? "Вино", secret: "x" }));
  }

  @Post()
  @HttpCode(202)
  create(@Body({ schema: NewItem }) body: z.infer<typeof NewItem>) {
    return { accepted: body.name };
  }

  @Post("subscribe")
  @HttpCode(204)
  @ValidationError("invalid_email", "Проверьте адрес — кажется, в нём опечатка")
  @RateLimit(2, 60_000)
  subscribe(@Body({ schema: z.object({ email: z.email() }) }) _body: { email: string }) {}

  @Get("broken")
  @ContractResponse(Item)
  broken() {
    return { id: 1 };
  }
}

@Module({ controllers: [ItemsController] })
class ItemsModule {}

describe("service-kit: контракт на входе и выходе", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const config = loadConfig(baseConfigSchema, { SERVICE_NAME: "test", NODE_ENV: "test", LOG_LEVEL: "silent" });
    app = await createTestApp({
      module: class TestApp {},
      imports: [ServiceKitModule.forRoot({ config }), ItemsModule],
    });
  });
  afterAll(() => app.close());

  it("ответ проходит схему: лишние поля отрезаны", async () => {
    const res = await app.inject({ method: "GET", url: "/api/items?limit=2" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      { id: "0", name: "Вино" },
      { id: "1", name: "Вино" },
    ]);
  });

  it("числа из строки запроса приводятся по схеме, строки остаются строками", async () => {
    const res = await app.inject({ method: "GET", url: "/api/items?limit=1&slug=1988" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([{ id: "0", name: "1988" }]);
  });

  it("неверная строка запроса — 400 validation_failed с путём поля", async () => {
    const res = await app.inject({ method: "GET", url: "/api/items?limit=99" });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ code: "validation_failed", message: "Проверьте данные запроса", details: [{ path: "limit" }] });
  });

  it("неверное тело — 422 validation_failed", async () => {
    const res = await app.inject({ method: "POST", url: "/api/items", payload: { name: "x" } });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toMatchObject({ code: "validation_failed", details: [{ path: "name" }] });
  });

  it("верное тело проходит", async () => {
    const res = await app.inject({ method: "POST", url: "/api/items", payload: { name: "Шабли" } });
    expect(res.statusCode).toBe(202);
  });

  it("@ValidationError: свой код и текст вместо validation_failed, подробности сохраняются", async () => {
    const res = await app.inject({ method: "POST", url: "/api/items/subscribe", payload: { email: "нет" } });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toMatchObject({ code: "invalid_email", message: "Проверьте адрес — кажется, в нём опечатка", details: [{ path: "email" }] });
  });

  it("@RateLimit: сверх лимита — 429 в формате контракта", async () => {
    const send = () => app.inject({ method: "POST", url: "/api/items/subscribe", payload: { email: "a@b.ru" }, remoteAddress: "10.0.0.7" });
    expect((await send()).statusCode).toBe(204);
    expect((await send()).statusCode).toBe(204);
    const limited = await send();
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toEqual({ code: "too_many_requests", message: "Слишком много запросов — попробуйте чуть позже" });
  });

  it("ответ не по схеме — 500 без подробностей наружу", async () => {
    const res = await app.inject({ method: "GET", url: "/api/items/broken" });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ code: "internal", message: "Что-то пошло не так — попробуйте позже" });
  });

  it("битый JSON — 400 в формате контракта", async () => {
    const res = await app.inject({ method: "POST", url: "/api/items", headers: { "content-type": "application/json" }, payload: "{" });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toHaveProperty("code");
  });

  it("тело больше 64 КБ — 413", async () => {
    const res = await app.inject({ method: "POST", url: "/api/items", payload: { name: "x".repeat(70_000) } });
    expect(res.statusCode).toBe(413);
    expect(res.json()).toEqual({ code: "payload_too_large", message: "Слишком большой запрос" });
  });
});
