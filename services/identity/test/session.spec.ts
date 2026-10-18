import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { zGetSessionResponse } from "@wine/contracts/openapi/zod";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";

describe("identity", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const config = loadConfig(configSchema, { SERVICE_NAME: "identity", NODE_ENV: "test", LOG_LEVEL: "silent" });
    app = await createTestApp(AppModule.forRoot(config));
  });
  afterAll(() => app.close());

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "identity")).toEqual([]);
  });

  it("GET /api/auth/session — гость, по схеме контракта, без кэша", async () => {
    const res = await app.inject({ method: "GET", url: "/api/auth/session" });
    expect(res.statusCode).toBe(200);
    expect(zGetSessionResponse.parse(res.json())).toEqual({ user: null });
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("неизвестный путь — 404 в формате контракта", async () => {
    const res = await app.inject({ method: "GET", url: "/api/auth/nope" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ code: "not_found", message: "Такого адреса нет" });
  });

  it("пробы здоровья — вне /api", async () => {
    expect((await app.inject({ method: "GET", url: "/health/live" })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: "/health/ready" })).statusCode).toBe(200);
  });

  it("прокидывает x-request-id шлюза", async () => {
    const res = await app.inject({ method: "GET", url: "/api/auth/session", headers: { "x-request-id": "req-42" } });
    expect(res.headers["x-request-id"]).toBe("req-42");
  });
});
