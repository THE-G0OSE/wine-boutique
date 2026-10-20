import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zCreateCellarRequestResponse, zGetCellarCellsResponse } from "@wine/contracts/openapi/zod";
import { cellarCellFixtures } from "@wine/demo-data";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";
import { seedCells } from "../src/infrastructure/prisma/seed-cells.js";

describe("cellar на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    await migrateDatabase(DATABASE_URL);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    await seedCells(prisma);
    const config = loadConfig(configSchema, { SERVICE_NAME: "cellar", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config));
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const request = (payload: object) =>
    app.inject({ method: "POST", url: "/api/cellar/requests", payload, remoteAddress: `10.5.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
  const body = (overrides: object = {}) => ({
    cellNumber: "204",
    term: "1y",
    name: " Иван ",
    phone: "+79161234567",
    bottles: 18,
    email: "ivan@example.ru",
    consents: { personalData: true },
    ...overrides,
  });

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "cellar")).toEqual([]);
  });

  it("стена — как в эталоне моков, без кэша", async () => {
    const res = await app.inject({ method: "GET", url: "/api/cellar/cells" });
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(zGetCellarCellsResponse.parse(res.json())).toEqual(cellarCellFixtures);
  });

  it("заявка на свободную: ответ без контактов, в базе — контакты, срок и версия согласия; ячейка остаётся свободной", async () => {
    const res = await request(body());
    expect(res.statusCode, res.body).toBe(201);
    const created = zCreateCellarRequestResponse.parse(res.json());
    expect(created).toMatchObject({ cellNumber: "204", tier: "medium", term: "1y" });
    expect(res.body).not.toContain("79161234567");
    const stored = await prisma.cellRequest.findUniqueOrThrow({ where: { id: created.id } });
    expect(stored).toMatchObject({ customerName: "Иван", phone: "+79161234567", bottles: 18, term: "y1", status: "new", consentVersion: "2026-10-20" });
    expect((await prisma.cell.findUniqueOrThrow({ where: { number: "204" } })).status).toBe("free");
  });

  it("занятая ячейка — 409 cell_busy", async () => {
    const res = await request(body({ cellNumber: "102" }));
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ code: "cell_busy" });
  });

  it("неверные имя, телефон, срок, ячейка или без согласия — 422 invalid_request", async () => {
    for (const overrides of [{ name: "  " }, { phone: "89161234567" }, { term: "5y" }, { cellNumber: "999" }, { consents: { personalData: false } }, { bottles: 0 }]) {
      const res = await request(body(overrides));
      expect(res.statusCode, JSON.stringify(overrides)).toBe(422);
      expect(res.json()).toMatchObject({ code: "invalid_request" });
    }
  });

  it("сид можно запускать повторно — занятость не сбрасывается", async () => {
    await prisma.cell.update({ where: { number: "101" }, data: { status: "busy" } });
    await seedCells(prisma);
    expect(await prisma.cell.count()).toBe(32);
    expect((await prisma.cell.findUniqueOrThrow({ where: { number: "101" } })).status).toBe("busy");
  });
});
