import "reflect-metadata";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zGetGrapesResponse, zGetWinesResponse } from "@wine/contracts/openapi/zod";
import { listWines, wineFixtureList } from "@wine/demo-data";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { grpcServerOptions } from "../src/grpc-server.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";
import { seedCatalog } from "../src/infrastructure/prisma/seed-catalog.js";

// Порт gRPC на время тестов — случайный, чтобы не столкнуться с запущенным Compose
const GRPC_URL = `127.0.0.1:${40_000 + Math.floor(Math.random() * 10_000)}`;

type Call<Req, Res> = (request: Req, callback: (error: grpc.ServiceError | null, response: Res) => void) => void;
interface CatalogClient extends grpc.Client {
  GetWineSummaries: Call<{ ids: string[] }, { wines: { id: string; slug: string; name: string; vintage?: number }[] }>;
  ResolveWineSlugs: Call<{ slugs: string[] }, { idsBySlug: Record<string, string> }>;
}
const call = <Req, Res>(method: Call<Req, Res>, client: grpc.Client, request: Req) =>
  new Promise<Res>((resolve, reject) => method.call(client, request, (error, response) => (error ? reject(error) : resolve(response))));

describe("catalog на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;
  let client: CatalogClient;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    // Те же миграции, что уходят в прод
    execSync("pnpm exec prisma migrate deploy", { env: { ...process.env, DATABASE_URL }, stdio: "pipe" });
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    await seedCatalog(prisma);

    const config = loadConfig(configSchema, { SERVICE_NAME: "catalog", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config), { grpc: grpcServerOptions(GRPC_URL) });

    const definition = protoLoader.loadSync(fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto")), {
      keepCase: false,
      longs: Number,
      defaults: false,
    });
    const proto = grpc.loadPackageDefinition(definition) as unknown as {
      wine: { catalog: { v1: { CatalogService: new (url: string, credentials: grpc.ChannelCredentials) => CatalogClient } } };
    };
    client = new proto.wine.catalog.v1.CatalogService(GRPC_URL, grpc.credentials.createInsecure());
  }, 180_000);

  afterAll(async () => {
    client?.close();
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "catalog")).toEqual([]);
  });

  it("GET /api/wines — страница по схеме контракта, кэшируется", async () => {
    const res = await app.inject({ method: "GET", url: "/api/wines" });
    expect(res.statusCode).toBe(200);
    const page = zGetWinesResponse.parse(res.json());
    expect(page.total).toBe(wineFixtureList.length);
    expect(page.items).toHaveLength(12);
    expect(page.items[0]).toMatchObject({ slug: "chateau-d-yquem-1988", volume: "0,75 л", vintage: 1988, bottle: "sweet" });
    expect(res.headers["cache-control"]).toBe("public, max-age=60");
  });

  it("пагинация: limit и offset из строки запроса", async () => {
    const all = zGetWinesResponse.parse((await app.inject({ method: "GET", url: "/api/wines?limit=48" })).json());
    const page = zGetWinesResponse.parse((await app.inject({ method: "GET", url: "/api/wines?limit=2&offset=2" })).json());
    expect(page.total).toBe(wineFixtureList.length);
    expect(page.items.map((w) => w.slug)).toEqual(all.items.slice(2, 4).map((w) => w.slug));
  });

  it("фильтр по типу и сортировка по году: вина без года — в конце", async () => {
    const sweet = zGetWinesResponse.parse((await app.inject({ method: "GET", url: "/api/wines?category=sweet" })).json());
    expect(sweet.total).toBe(listWines({ category: "sweet" }).total);
    expect(sweet.items.every((w) => w.categories.includes("sweet"))).toBe(true);

    const byVintage = zGetWinesResponse.parse((await app.inject({ method: "GET", url: "/api/wines?sort=vintage_asc&limit=48" })).json());
    const vintages = byVintage.items.map((w) => w.vintage);
    const firstNull = vintages.indexOf(null);
    expect(vintages.slice(0, firstNull)).toEqual([...vintages.slice(0, firstNull)].sort((a, b) => a! - b!));
    expect(vintages.slice(firstNull).every((v) => v === null)).toBe(true);
  });

  it("неизвестная сортировка — 400 по контракту", async () => {
    const res = await app.inject({ method: "GET", url: "/api/wines?sort=cheapest" });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ code: "validation_failed", details: [{ path: "sort" }] });
  });

  it("GET /api/grapes — шесть сортов, у каждого до трёх вин", async () => {
    const res = await app.inject({ method: "GET", url: "/api/grapes" });
    expect(res.statusCode).toBe(200);
    const grapes = zGetGrapesResponse.parse(res.json());
    expect(grapes.map((g) => g.slug)).toEqual([
      "cabernet-sauvignon",
      "chardonnay",
      "merlot",
      "sauvignon-blanc",
      "pinot-noir",
      "riesling",
    ]);
    expect(grapes.every((g) => g.wines.length > 0 && g.wines.length <= 3)).toBe(true);
  });

  it("готовность проверяет базу", async () => {
    const res = await app.inject({ method: "GET", url: "/health/ready" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ info: { database: { status: "up" } } });
  });

  it("gRPC: карточки вин по id — в порядке запроса, неизвестные пропущены", async () => {
    const { idsBySlug } = await call(client.ResolveWineSlugs, client, { slugs: ["cristal-2008", "chateau-d-yquem-1988", "нет-такого"] });
    expect(Object.keys(idsBySlug).sort()).toEqual(["chateau-d-yquem-1988", "cristal-2008"]);

    const ids = [idsBySlug["cristal-2008"], "00000000-0000-7000-8000-000000000000", idsBySlug["chateau-d-yquem-1988"]];
    const { wines } = await call(client.GetWineSummaries, client, { ids });
    expect(wines.map((w) => w.slug)).toEqual(["cristal-2008", "chateau-d-yquem-1988"]);
    expect(wines[1]).toMatchObject({ name: "Château d’Yquem 1988", vintage: 1988 });
  });

  it("сид можно запускать повторно — данные не дублируются", async () => {
    await seedCatalog(prisma);
    expect(await prisma.wine.count()).toBe(wineFixtureList.length);
    expect(await prisma.grapeVarietyWine.count()).toBe(18);
  }, 60_000);
});
