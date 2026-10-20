import "reflect-metadata";
import { fileURLToPath } from "node:url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zCreateReservationResponse, zGetBoutiqueSlotsResponse, zGetBoutiquesResponse, zGetReservationResponse } from "@wine/contracts/openapi/zod";
import { boutiqueFixtures, holdUntilOf, pickupDays, toZonedIso } from "@wine/demo-data";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";
import { seedBoutiques } from "../src/infrastructure/prisma/seed-boutiques.js";

/** Поддельный catalog по тому же proto: знает два вина — с ценой и без */
const WINES: Record<string, { id: string; slug: string; name: string; imageUrl: string; priceKopecks?: number }> = {
  "wine-1": { id: "wine-1", slug: "sassicaia-2015", name: "Sassicaia 2015", imageUrl: "/images/bottles/red.webp", priceKopecks: 1_250_000 },
  "wine-2": { id: "wine-2", slug: "cristal-2008", name: "Cristal 2008", imageUrl: "/images/bottles/sparkling.webp" },
};

const startFakeCatalog = async () => {
  const definition = protoLoader.loadSync(fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto")), {
    keepCase: false,
    longs: Number,
    defaults: false,
  });
  const proto = grpc.loadPackageDefinition(definition) as unknown as {
    wine: { catalog: { v1: { CatalogService: { service: grpc.ServiceDefinition } } } };
  };
  const server = new grpc.Server();
  server.addService(proto.wine.catalog.v1.CatalogService.service, {
    GetWineSummaries: (call: grpc.ServerUnaryCall<{ ids: string[] }, unknown>, callback: grpc.sendUnaryData<unknown>) =>
      callback(null, { wines: call.request.ids.flatMap((id) => WINES[id] ?? []) }),
    ResolveWineSlugs: (_call: unknown, callback: grpc.sendUnaryData<unknown>) => callback(null, { idsBySlug: {} }),
  });
  const port = await new Promise<number>((resolve, reject) =>
    server.bindAsync("127.0.0.1:0", grpc.ServerCredentials.createInsecure(), (error, bound) => (error ? reject(error) : resolve(bound)))
  );
  return { url: `127.0.0.1:${port}`, stop: () => server.forceShutdown() };
};

describe("reservations на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;
  let catalog: Awaited<ReturnType<typeof startFakeCatalog>>;
  let databaseUrl: string;

  const appWithCatalog = async (catalogUrl: string, timeoutMs = 3000) => {
    const config = loadConfig(configSchema, {
      SERVICE_NAME: "reservations",
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      DATABASE_URL: databaseUrl,
      CATALOG_GRPC_URL: catalogUrl,
      CATALOG_TIMEOUT_MS: String(timeoutMs),
    });
    return createTestApp(AppModule.forRoot(config));
  };

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    databaseUrl = pg.getConnectionUri();
    await migrateDatabase(databaseUrl);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
    await seedBoutiques(prisma);
    catalog = await startFakeCatalog();
    app = await appWithCatalog(catalog.url);
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    catalog?.stop();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const get = (url: string) => app.inject({ method: "GET", url: `/api${url}` });
  const reserve = (payload: object, target = app) =>
    target.inject({ method: "POST", url: "/api/reservations", payload, remoteAddress: `10.3.0.${Math.floor(Math.random() * 250)}` });

  /** Первое свободное время в бутике — как его выберет форма */
  const firstSlot = async (boutiqueId: string) => {
    const days = zGetBoutiqueSlotsResponse.parse((await get(`/boutiques/${boutiqueId}/slots`)).json());
    const day = days.find((item) => item.times.length > 0)!;
    return { date: day.date, time: day.times[0] };
  };

  const body = (overrides: object = {}) => ({
    boutiqueId: "cellar",
    name: " Иван ",
    phone: "+79161234567",
    email: "ivan@example.ru",
    items: [
      { wineId: "wine-1", qty: 2 },
      { wineId: "wine-2", qty: 1 },
    ],
    consents: { adult: true, personalData: true },
    ...overrides,
  });

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "reservations")).toEqual([]);
  });

  it("бутики — из демо-данных, по схеме контракта", async () => {
    expect(zGetBoutiquesResponse.parse((await get("/boutiques")).json())).toEqual(boutiqueFixtures);
  });

  it("слоты на семь дней — как в эталоне; неизвестный бутик — 404", async () => {
    for (const boutique of boutiqueFixtures) {
      const res = await get(`/boutiques/${boutique.id}/slots`);
      expect(res.headers["cache-control"]).toBe("no-store");
      expect(zGetBoutiqueSlotsResponse.parse(res.json())).toEqual(pickupDays(boutique, new Date()));
    }
    expect((await get("/boutiques/nowhere/slots")).statusCode).toBe(404);
  });

  it("бронь: снимок вин с ценами, номер, «держим до» по правилам; квитанция — без телефона и почты", async () => {
    const slot = await firstSlot("cellar");
    const res = await reserve(body(slot));
    expect(res.statusCode, res.body).toBe(201);
    const reservation = zCreateReservationResponse.parse(res.json());
    const boutique = boutiqueFixtures.find(({ id }) => id === "cellar")!;
    expect(reservation.number).toMatch(/^WB-\d{6}$/);
    expect(reservation).toMatchObject({
      status: "active",
      customerName: "Иван",
      pickupAt: `${slot.date}T${slot.time}:00+03:00`,
      holdUntil: toZonedIso(holdUntilOf(boutique, slot.date), boutique.timezone),
      boutique,
      total: null,
    });
    expect(reservation.items).toEqual([
      { wineId: "wine-1", slug: "sassicaia-2015", name: "Sassicaia 2015", image: "/images/bottles/red.webp", qty: 2, price: 12_500 },
      { wineId: "wine-2", slug: "cristal-2008", name: "Cristal 2008", image: "/images/bottles/sparkling.webp", qty: 1, price: null },
    ]);
    expect(res.body).not.toContain("79161234567");

    const again = await get(`/reservations/${reservation.id}`);
    expect(again.headers["cache-control"]).toBe("private, no-store");
    expect(zGetReservationResponse.parse(again.json())).toEqual(reservation);
    expect(again.body).not.toContain("ivan@example.ru");

    // В базе — контакты и согласие с версией текста
    const stored = await prisma.reservation.findUniqueOrThrow({ where: { id: reservation.id } });
    expect(stored).toMatchObject({ phone: "+79161234567", email: "ivan@example.ru", consentVersion: "2026-10-20" });
  });

  it("одно вино в двух строках складывается; сумма — когда у всех вин есть цена", async () => {
    const res = await reserve(body({ ...(await firstSlot("street")), boutiqueId: "street", items: [{ wineId: "wine-1", qty: 1 }, { wineId: "wine-1", qty: 2 }] }));
    const reservation = zCreateReservationResponse.parse(res.json());
    expect(reservation.items).toEqual([expect.objectContaining({ wineId: "wine-1", qty: 3 })]);
    expect(reservation.total).toBe(37_500);
    // Номера идут по порядку
    const last = await prisma.reservation.findFirstOrThrow({ orderBy: { number: "desc" } });
    expect(reservation.number).toBe(`WB-${String(last.number).padStart(6, "0")}`);
  });

  it("неверные контакты и без согласий — 422 invalid_reservation", async () => {
    const slot = await firstSlot("street");
    for (const overrides of [{ phone: "89161234567" }, { name: "   " }, { consents: { adult: true, personalData: false } }, { items: [] }]) {
      const res = await reserve(body({ ...slot, boutiqueId: "street", ...overrides }));
      expect(res.statusCode, JSON.stringify(overrides)).toBe(422);
      expect(res.json()).toMatchObject({ code: "invalid_reservation" });
    }
  });

  it("время прошло или бутик закрыт — 422 slot_unavailable", async () => {
    const res = await reserve(body({ date: "2020-01-01", time: "15:00" }));
    expect(res.statusCode).toBe(422);
    expect(res.json()).toMatchObject({ code: "slot_unavailable" });
    const sunday = pickupDays(boutiqueFixtures[1], new Date()).find((day) => day.times.length === 0)!;
    expect((await reserve(body({ date: sunday.date, time: "15:00" }))).json()).toMatchObject({ code: "slot_unavailable" });
  });

  it("вина нет на полках — 422 unknown_wines с его id", async () => {
    const res = await reserve(body({ ...(await firstSlot("cellar")), items: [{ wineId: "wine-1", qty: 1 }, { wineId: "gone", qty: 1 }] }));
    expect(res.statusCode).toBe(422);
    expect(res.json()).toMatchObject({ code: "unknown_wines", details: ["gone"] });
  });

  it("catalog не отвечает — 503 catalog_unavailable, бронь не создана", async () => {
    const before = await prisma.reservation.count();
    const lonely = await appWithCatalog("127.0.0.1:1", 500);
    try {
      const res = await reserve(body(await firstSlot("cellar")), lonely);
      expect(res.statusCode).toBe(503);
      expect(res.json()).toMatchObject({ code: "catalog_unavailable" });
    } finally {
      await lonely.close();
    }
    expect(await prisma.reservation.count()).toBe(before);
  }, 30_000);

  it("неизвестная бронь — 404, не uuid — 400", async () => {
    expect((await get("/reservations/0b9a3b54-6c55-4a43-9a3e-5d6f1f1f1f1f")).statusCode).toBe(404);
    expect((await get("/reservations/WB-000001")).statusCode).toBe(400);
  });
});
