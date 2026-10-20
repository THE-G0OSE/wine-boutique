import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import {
  zCreateCertificateResponse,
  zCreateGiftRequestResponse,
  zCreateHallRequestResponse,
  zCreateMonthlySubscriptionResponse,
  zGetMonthlyCratesResponse,
} from "@wine/contracts/openapi/zod";
import { certificateValidUntil, monthlyCrateFixtures, monthlyCrates } from "@wine/demo-data";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";
import { seedCrates } from "../src/infrastructure/prisma/seed-crates.js";

/** Дата через n дней по Москве */
const inDays = (days: number) => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [y, m, d] = today.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

describe("requests на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    await migrateDatabase(DATABASE_URL);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    await seedCrates(prisma);
    const config = loadConfig(configSchema, { SERVICE_NAME: "requests", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config));
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const post = (url: string, payload: object) =>
    app.inject({ method: "POST", url: `/api${url}`, payload, remoteAddress: `10.6.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
  const consents = { personalData: true };
  const expectInvalid = async (url: string, payload: object) => {
    const res = await post(url, payload);
    expect(res.statusCode, `${url} ${JSON.stringify(payload)}`).toBe(422);
    expect(res.json()).toMatchObject({ code: "invalid_request" });
  };

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "requests")).toEqual([]);
  });

  it("зал: заявка с номером, в базе — параметры и телефон; вместимость и даты проверяются", async () => {
    const hall = { layout: "banquet", date: inDays(7), guests: 12, phone: "+79161234567", consents };
    const res = await post("/requests/hall", hall);
    expect(res.statusCode, res.body).toBe(201);
    const created = zCreateHallRequestResponse.parse(res.json());
    expect(created.number).toMatch(/^R-\d{6}$/);
    expect(res.body).not.toContain("79161234567");
    const stored = await prisma.serviceRequest.findUniqueOrThrow({ where: { id: created.id } });
    expect(stored).toMatchObject({ kind: "hall", status: "new", phone: "+79161234567", details: { layout: "banquet", date: hall.date, guests: 12 } });

    await expectInvalid("/requests/hall", { ...hall, guests: 15 });
    await expectInvalid("/requests/hall", { ...hall, date: inDays(0) });
    await expectInvalid("/requests/hall", { ...hall, date: inDays(400) });
    await expectInvalid("/requests/hall", { ...hall, layout: "disco" });
    expect((await post("/requests/hall", { ...hall, layout: "buffet", guests: 30 })).statusCode).toBe(201);
  });

  it("подарки: смета с упаковкой, дополнениями без повторов и биркой; компания обязательна", async () => {
    const gift = {
      pack: "wooden",
      bottles: 2,
      extras: ["glasses", "logo"],
      engraving: " С благодарностью ",
      run: "from50",
      company: "ООО «Тест»",
      contactName: "Мария",
      phone: "+79161234567",
      email: "maria@example.ru",
      consents,
    };
    const res = await post("/requests/gift", gift);
    expect(res.statusCode, res.body).toBe(201);
    const { id } = zCreateGiftRequestResponse.parse(res.json());
    expect(await prisma.serviceRequest.findUniqueOrThrow({ where: { id } })).toMatchObject({
      kind: "gift",
      company: "ООО «Тест»",
      email: "maria@example.ru",
      details: { pack: "wooden", bottles: 2, extras: ["glasses", "logo"], engraving: "С благодарностью", run: "from50" },
    });
    await expectInvalid("/requests/gift", { ...gift, company: "  " });
    await expectInvalid("/requests/gift", { ...gift, bottles: 4 });
    await expectInvalid("/requests/gift", { ...gift, email: "не почта" });
  });

  it("набор месяца — как в эталоне моков, с кэшем на час", async () => {
    const res = await app.inject({ method: "GET", url: "/api/monthly" });
    expect(res.headers["cache-control"]).toBe("public, max-age=3600");
    expect(zGetMonthlyCratesResponse.parse(res.json())).toEqual(monthlyCrates(monthlyCrateFixtures, new Date()));
  });

  it("подписка на набор: повтор с тем же телефоном меняет набор, номер тот же", async () => {
    const first = zCreateMonthlySubscriptionResponse.parse(
      (await post("/monthly/subscriptions", { plan: "classic", name: "Олег", phone: "+79160000001", boutiqueId: "street", consents })).json()
    );
    expect(first.number).toMatch(/^M-\d{6}$/);
    const again = zCreateMonthlySubscriptionResponse.parse(
      (await post("/monthly/subscriptions", { plan: "cellar", name: "Олег", phone: "+79160000001", boutiqueId: "cellar", consents })).json()
    );
    expect(again).toEqual(first);
    expect(await prisma.monthlySubscription.findMany()).toEqual([expect.objectContaining({ plan: "cellar", boutiqueId: "cellar", status: "active" })]);
    await expectInvalid("/monthly/subscriptions", { plan: "classic", name: " ", phone: "+79160000002", boutiqueId: "street", consents });
  });

  it("сертификат: номер WB-год-номер, ждёт оплаты, действует год; электронному нужен e-mail", async () => {
    const certificate = { nominal: 10_000, to: "Анне", from: "Михаила", format: "envelope", phone: "+79161234567", consents };
    const res = await post("/certificates", certificate);
    expect(res.statusCode, res.body).toBe(201);
    const issued = zCreateCertificateResponse.parse(res.json());
    expect(issued).toMatchObject({ nominal: 10_000, status: "awaiting_payment", validUntil: certificateValidUntil(new Date()) });
    expect(issued.serial).toMatch(new RegExp(`^WB-${new Date().getFullYear()}-\\d{6}$`));

    await expectInvalid("/certificates", { ...certificate, format: "email" });
    expect((await post("/certificates", { ...certificate, format: "email", recipientEmail: "anna@example.ru" })).statusCode).toBe(201);
    await expectInvalid("/certificates", { ...certificate, nominal: 2000 });
    await expectInvalid("/certificates", { ...certificate, to: "   " });
  });

  it("сид можно запускать повторно — ящики не дублируются", async () => {
    await seedCrates(prisma);
    expect(await prisma.monthlyCrate.count()).toBe(monthlyCrateFixtures.length);
  });
});
