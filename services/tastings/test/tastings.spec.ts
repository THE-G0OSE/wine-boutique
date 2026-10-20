import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zCreateTastingBookingResponse, zGetTastingsResponse } from "@wine/contracts/openapi/zod";
import { addMonths, listTastings, tastingMonths } from "@wine/demo-data";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";
import { seedTastings } from "../src/infrastructure/prisma/seed-tastings.js";

/** Дегустация для сценариев записи — в далёком будущем, чтобы не зависеть от сегодняшней даты */
const testTasting = (id: string, seatsTaken: number, startsAt = new Date("2099-01-09T16:30:00Z")) => ({
  id,
  kind: "blind" as const,
  title: "Тестовая слепая",
  description: "Для тестов",
  startsAt,
  durationMinutes: 120,
  wines: 6,
  capacity: 12,
  seatsTaken,
  priceKopecks: 450_000,
  host: "[имя сомелье]",
});

describe("tastings на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    await migrateDatabase(DATABASE_URL);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    await seedTastings(prisma);
    await prisma.tasting.createMany({
      data: [
        testTasting("2099-01-09-1930", 4),
        testTasting("2099-01-10-1930", 12),
        testTasting("2099-01-11-1930", 9),
        testTasting("2020-01-10-1930", 2, new Date("2020-01-10T16:30:00Z")),
      ],
    });
    const config = loadConfig(configSchema, { SERVICE_NAME: "tastings", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config));
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const get = (url: string) => app.inject({ method: "GET", url: `/api${url}` });
  const post = (url: string, payload: object) =>
    app.inject({ method: "POST", url: `/api${url}`, payload, remoteAddress: `10.4.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
  const guest = (overrides: object = {}) => ({ name: " Анна ", phone: "+79161234567", guests: 2, consents: { personalData: true }, ...overrides });

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "tastings")).toEqual([]);
  });

  it("афиша месяцев — как в эталоне моков; месяц вне афиши пустой; без кэша", async () => {
    const now = new Date();
    for (const month of tastingMonths(now)) {
      const res = await get(`/tastings?month=${month}`);
      expect(res.headers["cache-control"]).toBe("no-store");
      expect(zGetTastingsResponse.parse(res.json()), month).toEqual(listTastings(month, now));
    }
    const outside = addMonths(tastingMonths(now)[0], -2);
    expect((await get(`/tastings?month=${outside}`)).json()).toEqual([]);
  });

  it("неверный месяц — 400 по контракту", async () => {
    for (const query of ["", "?month=2026-13", "?month=октябрь"]) {
      const res = await get(`/tastings${query}`);
      expect(res.statusCode, query).toBe(400);
      expect(res.json()).toMatchObject({ code: "validation_failed" });
    }
  });

  it("запись: места занимаются, приглашение без телефона; в базе — контакты и версия согласия", async () => {
    const res = await post("/tastings/2099-01-09-1930/bookings", guest());
    expect(res.statusCode, res.body).toBe(201);
    const booking = zCreateTastingBookingResponse.parse(res.json());
    expect(booking).toMatchObject({
      guests: 2,
      customerName: "Анна",
      tasting: { id: "2099-01-09-1930", seatsLeft: 6, status: "open", price: 4500, startsAt: "2099-01-09T19:30:00+03:00" },
    });
    expect(res.body).not.toContain("79161234567");
    const stored = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(stored).toMatchObject({ phone: "+79161234567", guests: 2, consentVersion: "2026-10-20" });
    expect((await get("/tastings?month=2099-01")).json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "2099-01-09-1930", seatsLeft: 6 })])
    );
  });

  it("гостей больше, чем мест — 409 not_enough_seats с остатком", async () => {
    const res = await post("/tastings/2099-01-11-1930/bookings", guest({ guests: 4 }));
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ code: "not_enough_seats", details: { seatsLeft: 3 } });
  });

  it("одновременные записи не продают лишних мест", async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => post("/tastings/2099-01-11-1930/bookings", guest({ guests: 1 }))));
    expect(results.filter((res) => res.statusCode === 201)).toHaveLength(3);
    expect(results.filter((res) => res.statusCode === 409)).toHaveLength(5);
    const tasting = await prisma.tasting.findUniqueOrThrow({ where: { id: "2099-01-11-1930" } });
    expect(tasting.seatsTaken).toBe(12);
    expect(await prisma.booking.count({ where: { tastingId: "2099-01-11-1930" } })).toBe(3);
  });

  it("лист ожидания: только когда мест нет, повтор с тем же телефоном не дублирует", async () => {
    expect((await post("/tastings/2099-01-10-1930/waitlist", guest())).statusCode).toBe(204);
    expect((await post("/tastings/2099-01-10-1930/waitlist", guest({ name: "Анна К.", guests: 3 }))).statusCode).toBe(204);
    const entries = await prisma.waitlistEntry.findMany({ where: { tastingId: "2099-01-10-1930" } });
    expect(entries).toEqual([expect.objectContaining({ customerName: "Анна К.", guests: 3, phone: "+79161234567" })]);

    const open = await post("/tastings/2099-01-09-1930/waitlist", guest());
    expect(open.statusCode).toBe(409);
    expect(open.json()).toMatchObject({ code: "seats_available" });
  });

  it("прошедшая дегустация — 409 tasting_closed и для записи, и для листа", async () => {
    for (const path of ["bookings", "waitlist"]) {
      const res = await post(`/tastings/2020-01-10-1930/${path}`, guest());
      expect(res.statusCode, path).toBe(409);
      expect(res.json()).toMatchObject({ code: "tasting_closed" });
    }
  });

  it("неверные имя, телефон, гости или нет согласия — 422 invalid_booking; нет дегустации — 404", async () => {
    for (const overrides of [{ name: "   " }, { phone: "89161234567" }, { guests: 7 }, { guests: 0 }, { consents: { personalData: false } }]) {
      const res = await post("/tastings/2099-01-09-1930/bookings", guest(overrides));
      expect(res.statusCode, JSON.stringify(overrides)).toBe(422);
      expect(res.json()).toMatchObject({ code: "invalid_booking" });
    }
    expect((await post("/tastings/2099-02-01-1930/bookings", guest())).statusCode).toBe(404);
  });

  it("сид можно запускать повторно — занятые места не сбрасываются", async () => {
    const [first] = await prisma.tasting.findMany({ where: { id: { not: { startsWith: "2099" } } }, orderBy: { startsAt: "desc" }, take: 1 });
    await prisma.tasting.update({ where: { id: first.id }, data: { seatsTaken: first.capacity } });
    const before = await prisma.tasting.count();
    await seedTastings(prisma);
    expect(await prisma.tasting.count()).toBe(before);
    expect((await prisma.tasting.findUniqueOrThrow({ where: { id: first.id } })).seatsTaken).toBe(first.capacity);
  });
});
