import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import {
  zGetSearchSuggestionsResponse,
  zGetShelvesResponse,
  zGetWineFacetsResponse,
  zGetWineResponse,
  zGetWinesResponse,
} from "@wine/contracts/openapi/zod";
import {
  listShelves,
  listWines,
  searchSuggestions,
  shelfFixtures,
  wineDetails,
  wineFacets,
  wineFixtureList,
  type WineFilter,
} from "@wine/demo-data";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";
import { seedCatalog } from "../src/infrastructure/prisma/seed-catalog.js";

/**
 * Магазин (фаза 3): сервис отвечает так же, как эталон каталога из @wine/demo-data, по которому работают моки фронта.
 * id в сервисе — uuid, в эталоне — slug, поэтому вина сравниваются без id.
 */

type Filter = Omit<WineFilter, "category">;

/** Строка запроса как у фронта: массив — повтор параметра */
const qs = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) if (item !== undefined) search.append(key, String(item));
  }
  return search.toString();
};

const withoutId = <T extends { id: string }>({ id: _id, ...rest }: T) => rest;

const FILTERS: Filter[] = [
  {},
  { country: ["Италия"] },
  { grape: ["пино нуар"] },
  { q: "пино" },
  { q: "бургундия пино" },
  { age: ["from_10_to_20", "over_20"] },
  { country: ["Франция", "Испания"], volume: [750] },
  { priceMin: 1000 },
];
const SHELVES = [undefined, ...shelfFixtures.map((shelf) => shelf.id)];
const SORTS = ["popular", "price_asc", "price_desc", "vintage_asc", "new"] as const;

describe("магазин на настоящем Postgres: как эталон моков", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    await migrateDatabase(DATABASE_URL);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    await seedCatalog(prisma);
    const config = loadConfig(configSchema, { SERVICE_NAME: "catalog", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config));
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const get = async (path: string) => {
    const res = await app.inject({ method: "GET", url: `/api${path}` });
    expect(res.statusCode, `${path}: ${res.body}`).toBe(200);
    return res.json();
  };

  it("GET /wines: полки × сортировки × фильтры — те же вина в том же порядке", async () => {
    for (const shelf of SHELVES)
      for (const sort of SORTS)
        for (const filter of FILTERS) {
          const page = zGetWinesResponse.parse(await get(`/wines?${qs({ shelf, sort, limit: 48, ...filter })}`));
          const expected = listWines({ shelf, sort, limit: 48, ...filter });
          expect(page.total, JSON.stringify({ shelf, sort, filter })).toBe(expected.total);
          expect(page.items.map((wine) => wine.slug), JSON.stringify({ shelf, sort, filter })).toEqual(expected.items.map((wine) => wine.slug));
        }
  }, 120_000);

  it("GET /wines: поля вина и страницы — как в эталоне", async () => {
    const page = zGetWinesResponse.parse(await get(`/wines?${qs({ shelf: "red", limit: 7, offset: 7 })}`));
    const expected = listWines({ shelf: "red", limit: 7, offset: 7 });
    expect(page.items.map(withoutId)).toEqual(expected.items.map(withoutId));
  });

  it("GET /wines/facets: счётчики без своей группы, плейсхолдеры не считаются", async () => {
    for (const shelf of SHELVES)
      for (const filter of FILTERS) {
        const facets = zGetWineFacetsResponse.parse(await get(`/wines/facets?${qs({ shelf, ...filter })}`));
        expect(facets, JSON.stringify({ shelf, filter })).toEqual(wineFacets({ shelf, ...filter }));
      }
  }, 60_000);

  it("GET /shelves: четыре полки по порядку, с фильтрами и лимитом", async () => {
    for (const filter of FILTERS) {
      const shelves = zGetShelvesResponse.parse(await get(`/shelves?${qs({ limit: 10, ...filter })}`));
      const expected = listShelves(filter, 10);
      expect(shelves.map((shelf) => ({ ...shelf, wines: shelf.wines.map(withoutId) })), JSON.stringify(filter)).toEqual(
        expected.map((shelf) => ({ ...shelf, wines: shelf.wines.map(withoutId) }))
      );
    }
  });

  it("GET /wines/{slug}: каждая карточка — как в эталоне, соседи по полке или выбор сомелье", async () => {
    for (const { slug } of wineFixtureList) {
      const card = zGetWineResponse.parse(await get(`/wines/${slug}`));
      const expected = wineDetails(slug)!;
      expect({ ...withoutId(card), related: card.related.map(withoutId) }, slug).toEqual({
        ...withoutId(expected),
        related: expected.related.map(withoutId),
      });
    }
  }, 60_000);

  it("GET /wines/{slug}: неизвестное вино — 404 в формате контракта", async () => {
    const res = await app.inject({ method: "GET", url: "/api/wines/chateau-imaginaire-1900" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ code: "not_found", message: "Такого вина на полках нет" });
  });

  it("GET /search/suggest: вина, сорта и регионы — как в эталоне, регистр и «ё» не важны", async () => {
    for (const q of ["пино", "Бург", "Италия", "кьянти классико", "ШАМПАНЬ", "Château", "семильон", "неттакого"]) {
      const suggestions = zGetSearchSuggestionsResponse.parse(await get(`/search/suggest?${qs({ q })}`));
      const expected = searchSuggestions(q);
      expect({ ...suggestions, wines: suggestions.wines.map(withoutId) }, q).toEqual({ ...expected, wines: expected.wines.map(withoutId) });
    }
  });

  it("неверные фильтры — 400 по контракту", async () => {
    for (const query of ["shelf=rose", "age=forever", "volume=много", "priceMin=-1", `q=${"я".repeat(101)}`]) {
      const res = await app.inject({ method: "GET", url: `/api/wines?${query}` });
      expect(res.statusCode, query).toBe(400);
      expect(res.json()).toMatchObject({ code: "validation_failed" });
    }
  });

  it("сид можно запускать повторно — полки и пары не дублируются", async () => {
    const before = [await prisma.wine.count(), await prisma.shelfWine.count(), await prisma.wineRelation.count()];
    await seedCatalog(prisma);
    expect([await prisma.wine.count(), await prisma.shelfWine.count(), await prisma.wineRelation.count()]).toEqual(before);
  }, 60_000);
});
