import "reflect-metadata";
import { fileURLToPath } from "node:url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zGetMyFavoritesResponse, zGetMyLoyaltyResponse } from "@wine/contracts/openapi/zod";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";

/** Поддельный catalog по тому же proto: два вина с полями списка */
const WINES: Record<string, object> = {
  "wine-1": {
    id: "wine-1",
    slug: "cristal-2008",
    name: "Cristal 2008",
    vintage: 2008,
    imageUrl: "/images/bottles/sparkling.webp",
    categories: ["sparkling"],
    region: "Шампань",
    country: "Франция",
    grapes: ["шардоне", "пино нуар"],
    volumeMl: 750,
    cellarYears: 7,
    bottle: "sparkling",
  },
  "wine-2": { id: "wine-2", slug: "chablis-premier-cru", name: "Шабли Премьер Крю", imageUrl: "/images/bottles/white.webp", priceKopecks: 650_000, categories: ["white"], region: "Бургундия", grapes: ["шардоне"], volumeMl: 375, bottle: "white" },
};

const startFakeCatalog = async () => {
  const definition = protoLoader.loadSync(fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto")), { keepCase: false, longs: Number, defaults: false });
  const proto = grpc.loadPackageDefinition(definition) as unknown as { wine: { catalog: { v1: { CatalogService: { service: grpc.ServiceDefinition } } } } };
  const server = new grpc.Server();
  server.addService(proto.wine.catalog.v1.CatalogService.service, {
    GetWineSummaries: (call: grpc.ServerUnaryCall<{ ids: string[] }, unknown>, callback: grpc.sendUnaryData<unknown>) =>
      callback(null, { wines: call.request.ids.flatMap((id) => WINES[id] ?? []) }),
    ResolveWineSlugs: (_call: unknown, callback: grpc.sendUnaryData<unknown>) => callback(null, { idsBySlug: {} }),
  });
  const port = await new Promise<number>((resolve, reject) => server.bindAsync("127.0.0.1:0", grpc.ServerCredentials.createInsecure(), (error, bound) => (error ? reject(error) : resolve(bound))));
  return { url: `127.0.0.1:${port}`, stop: () => server.forceShutdown() };
};

describe("loyalty на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;
  let catalog: Awaited<ReturnType<typeof startFakeCatalog>>;
  let databaseUrl: string;
  const user = "0192f0a0-0000-7000-8000-0000000a0007";
  const headers = { "x-user-id": user };

  const appWithCatalog = (url: string, timeoutMs = 3000) =>
    createTestApp(
      AppModule.forRoot(
        loadConfig(configSchema, { SERVICE_NAME: "loyalty", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL: databaseUrl, CATALOG_GRPC_URL: url, CATALOG_TIMEOUT_MS: String(timeoutMs) })
      )
    );

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    databaseUrl = pg.getConnectionUri();
    await migrateDatabase(databaseUrl);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
    catalog = await startFakeCatalog();
    app = await appWithCatalog(catalog.url);
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    catalog?.stop();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "loyalty")).toEqual([]);
  });

  it("бонусы: приветственные 500 один раз, уровень «гость», до ценителя — 6 бутылок", async () => {
    for (let i = 0; i < 2; i++) {
      const res = await app.inject({ method: "GET", url: "/api/me/loyalty", headers });
      expect(res.headers["cache-control"]).toBe("private, no-store");
      expect(zGetMyLoyaltyResponse.parse(res.json())).toMatchObject({
        balance: 500,
        level: "guest",
        bottles: 0,
        nextLevel: { level: "connoisseur", bottles: 6 },
        history: [{ title: "Приветственные бонусы", amount: 500 }],
      });
    }
    expect(await prisma.bonusEntry.count({ where: { userId: user } })).toBe(1);
  });

  it("избранное: добавить (повтор — 204), карточки из catalog по порядку добавления, убрать; неизвестное вино — 404", async () => {
    const put = (wineId: string) => app.inject({ method: "PUT", url: `/api/me/favorites/${wineId}`, headers });
    expect((await put("wine-1")).statusCode).toBe(204);
    expect((await put("wine-2")).statusCode).toBe(204);
    expect((await put("wine-2")).statusCode).toBe(204);
    expect((await put("nope")).statusCode).toBe(404);

    const list = zGetMyFavoritesResponse.parse((await app.inject({ method: "GET", url: "/api/me/favorites", headers })).json());
    expect(list.map((wine) => wine.slug)).toEqual(["chablis-premier-cru", "cristal-2008"]);
    expect(list[0]).toMatchObject({ volume: "0,375 л", price: 6500, country: null, cellarYears: null, image: "/images/bottles/white.webp" });
    expect(list[1]).toMatchObject({ volume: "0,75 л", price: null, vintage: 2008, cellarYears: 7, categories: ["sparkling"] });

    expect((await app.inject({ method: "DELETE", url: "/api/me/favorites/wine-2", headers })).statusCode).toBe(204);
    expect((await app.inject({ method: "DELETE", url: "/api/me/favorites/wine-2", headers })).statusCode).toBe(204);
    expect(zGetMyFavoritesResponse.parse((await app.inject({ method: "GET", url: "/api/me/favorites", headers })).json()).map((wine) => wine.id)).toEqual(["wine-1"]);
  });

  it("catalog не отвечает — 503 catalog_unavailable", async () => {
    const lonely = await appWithCatalog("127.0.0.1:1", 500);
    try {
      const res = await lonely.inject({ method: "GET", url: "/api/me/favorites", headers });
      expect(res.statusCode).toBe(503);
      expect(res.json()).toMatchObject({ code: "catalog_unavailable" });
    } finally {
      await lonely.close();
    }
  }, 30_000);

  it("без пользователя от шлюза — 401", async () => {
    expect((await app.inject({ method: "GET", url: "/api/me/loyalty" })).statusCode).toBe(401);
  });
});
