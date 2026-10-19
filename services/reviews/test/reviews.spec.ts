import "reflect-metadata";
import { execSync } from "node:child_process";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zGetReviewsResponse } from "@wine/contracts/openapi/zod";
import { reviewsFixture } from "@wine/demo-data";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { Moderation } from "../src/application/letters.js";
import { configSchema } from "../src/config.js";
import { LetterRuleError } from "../src/domain/letter.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";
import { seedReviews } from "../src/infrastructure/prisma/seed-reviews.js";

describe("reviews на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;
  let moderation: Moderation;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    execSync("pnpm exec prisma migrate deploy", { env: { ...process.env, DATABASE_URL }, stdio: "pipe" });
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    await seedReviews(prisma);
    const config = loadConfig(configSchema, { SERVICE_NAME: "reviews", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config));
    moderation = app.get(Moderation);
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const send = (payload: object, remoteAddress = "10.1.0.1") => app.inject({ method: "POST", url: "/api/reviews", payload, remoteAddress });
  const feed = async (query = "") => zGetReviewsResponse.parse((await app.inject({ method: "GET", url: `/api/reviews${query}` })).json());

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "reviews")).toEqual([]);
  });

  it("лента: опубликованные письма по схеме контракта, в порядке макета, с пагинацией", async () => {
    const first = await feed();
    expect(first.total).toBe(reviewsFixture.length);
    expect(first.items).toHaveLength(5);
    expect(first.items[0]).toMatchObject({ topic: "tasting", greeting: "Дорогая команда бутика!", author: "[Имя гостя]", receivedAt: null });
    const second = await feed("?limit=5&offset=5");
    expect([...first.items, ...second.items].map((r) => r.text)).toEqual(reviewsFixture.map((r) => r.text));
  });

  it("письмо с сайта — 202 и на модерацию, в ленте его нет", async () => {
    const res = await send({ name: " Анна ", city: "Казань", text: "Спасибо за вечер в погребе!" });
    expect(res.statusCode).toBe(202);
    expect(res.body).toBe("");
    const [pending] = await moderation.pending();
    expect(pending).toMatchObject({ authorName: "Анна", city: "Казань", status: "pending" });
    expect((await feed()).total).toBe(reviewsFixture.length);
  });

  it("неверное письмо — 422 invalid_letter, как в моке формы", async () => {
    const short = await send({ name: "Анна", text: "Коротко" });
    expect(short.statusCode).toBe(422);
    expect(short.json()).toMatchObject({ code: "invalid_letter", message: "Подпишите конверт и напишите хотя бы пару строк" });
    // Схема пропускает 10 пробелов, домен — нет
    const blank = await send({ name: "Анна", text: "          " });
    expect(blank.statusCode).toBe(422);
    expect(blank.json()).toMatchObject({ code: "invalid_letter" });
  });

  it("модерация: публикация только с темой, обращением и подписью; письмо встаёт первым в ленте", async () => {
    const [pending] = await moderation.pending();
    await expect(moderation.publish(pending.id, { topic: "tasting", greeting: " ", signature: "Анна" })).rejects.toThrow(LetterRuleError);
    await moderation.publish(pending.id, { topic: "tasting", greeting: "Дорогие друзья!", signature: "Анна" });
    const top = (await feed()).items[0];
    expect(top).toMatchObject({ id: pending.id, greeting: "Дорогие друзья!", author: "Анна", city: "Казань", postscript: null });
    expect(top.receivedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await expect(moderation.reject(pending.id)).rejects.toMatchObject({ code: "not_pending" });
  });

  it("сверх 5 писем в минуту с одного адреса — 429 в формате контракта", async () => {
    const letter = { name: "Бот", text: "Очень полезное письмо" };
    for (let i = 0; i < 5; i++) expect((await send(letter, "10.9.9.9")).statusCode).toBe(202);
    const limited = await send(letter, "10.9.9.9");
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({ code: "too_many_requests" });
  });

  it("сид можно запускать повторно — письма не дублируются", async () => {
    const before = await prisma.letter.count();
    await seedReviews(prisma);
    expect(await prisma.letter.count()).toBe(before);
  });
});
