import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";

describe("newsletter на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    await migrateDatabase(DATABASE_URL);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    const config = loadConfig(configSchema, { SERVICE_NAME: "newsletter", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config));
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const subscribe = (email: string, remoteAddress = "10.2.0.1") =>
    app.inject({ method: "POST", url: "/api/newsletter", payload: { email }, remoteAddress });

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "newsletter")).toEqual([]);
  });

  it("подписка — 204 без тела", async () => {
    const res = await subscribe("anna@example.ru");
    expect(res.statusCode).toBe(204);
    expect(res.body).toBe("");
    expect(await prisma.subscription.findUnique({ where: { email: "anna@example.ru" } })).toMatchObject({ status: "active", source: "footer" });
  });

  it("повторная подписка, даже в другом регистре, — тот же 204 и без дубля", async () => {
    expect((await subscribe("Anna@Example.RU")).statusCode).toBe(204);
    expect(await prisma.subscription.count()).toBe(1);
  });

  it("отписавшийся подписывается снова — подписка снова активна", async () => {
    await prisma.subscription.update({ where: { email: "anna@example.ru" }, data: { status: "unsubscribed" } });
    expect((await subscribe("anna@example.ru")).statusCode).toBe(204);
    expect((await prisma.subscription.findFirstOrThrow()).status).toBe("active");
  });

  it("неверный адрес — 422 invalid_email, как в моке формы", async () => {
    const res = await subscribe("не-адрес");
    expect(res.statusCode).toBe(422);
    expect(res.json()).toMatchObject({ code: "invalid_email", message: "Проверьте адрес — кажется, в нём опечатка" });
  });

  it("сверх 5 подписок в минуту с одного адреса — 429", async () => {
    for (let i = 0; i < 5; i++) expect((await subscribe(`bot${i}@example.ru`, "10.8.8.8")).statusCode).toBe(204);
    expect((await subscribe("bot5@example.ru", "10.8.8.8")).statusCode).toBe(429);
  });
});
