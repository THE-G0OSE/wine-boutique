import "reflect-metadata";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zGetLatestNewsIssueResponse, zGetNewsArchiveResponse, zGetNewsArticleResponse } from "@wine/contracts/openapi/zod";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";
import { seedNews } from "../src/infrastructure/prisma/seed-news.js";

const YQUEM_ID = "01a1518c-dde5-700a-a6a6-f2a80e919702";
const YQUEM_ARTICLE = "chateau-d-yquem-1988-v-pogrebe";

/** Поддельный catalog по тому же proto: отвечает про d’Yquem, может тормозить дольше дедлайна */
const startFakeCatalog = async (delayMs = 0) => {
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
    GetWineSummaries: (call: grpc.ServerUnaryCall<{ ids: string[] }, unknown>, callback: grpc.sendUnaryData<unknown>) => {
      const wines = (call.request.ids ?? [])
        .filter((id) => id === YQUEM_ID)
        .map((id) => ({ id, slug: "chateau-d-yquem-1988", name: "Château d’Yquem 1988", imageUrl: "/images/bottles/sweet.webp" }));
      setTimeout(() => callback(null, { wines }), delayMs);
    },
    ResolveWineSlugs: (_call: unknown, callback: grpc.sendUnaryData<unknown>) => callback(null, { idsBySlug: {} }),
  });
  const port = await new Promise<number>((resolve, reject) =>
    server.bindAsync("127.0.0.1:0", grpc.ServerCredentials.createInsecure(), (error, bound) => (error ? reject(error) : resolve(bound)))
  );
  return { url: `127.0.0.1:${port}`, stop: () => server.forceShutdown() };
};

describe("news на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let DATABASE_URL: string;
  let catalog: Awaited<ReturnType<typeof startFakeCatalog>>;
  const apps: NestFastifyApplication[] = [];

  const appWithCatalog = async (catalogUrl: string, timeoutMs = 1000) => {
    const config = loadConfig(configSchema, {
      SERVICE_NAME: "news",
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      DATABASE_URL,
      CATALOG_GRPC_URL: catalogUrl,
      CATALOG_TIMEOUT_MS: String(timeoutMs),
    });
    const app = await createTestApp(AppModule.forRoot(config));
    apps.push(app);
    return app;
  };

  let app: NestFastifyApplication;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    DATABASE_URL = pg.getConnectionUri();
    execSync("pnpm exec prisma migrate deploy", { env: { ...process.env, DATABASE_URL }, stdio: "pipe" });
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    await seedNews(prisma, async (slugs) => new Map(slugs.filter((s) => s === "chateau-d-yquem-1988").map((s) => [s, YQUEM_ID])));
    catalog = await startFakeCatalog();
    app = await appWithCatalog(catalog.url);
  }, 180_000);

  afterAll(async () => {
    for (const each of apps) await each.close();
    catalog?.stop();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "news")).toEqual([]);
  });

  it("свежий выпуск — № 23 по схеме контракта, с соседями по дате", async () => {
    const res = await app.inject({ method: "GET", url: "/api/news/issues/latest" });
    expect(res.statusCode).toBe(200);
    const issue = zGetLatestNewsIssueResponse.parse(res.json());
    expect(issue).toMatchObject({ number: 23, publishedAt: "2026-10-16", nextIssueId: null });
    expect(issue.lead.slug).toBe(YQUEM_ARTICLE);
    expect(issue.stories.map((s) => s.slug)).toEqual(["nachalsya-sbor-vinograda", "vecher-klassika-starogo-sveta"]);
    expect(issue.stories[1].event).toEqual({ startsAt: null, seats: null });
    expect(issue.previousIssueId).not.toBeNull();
  });

  it("статья: вино для стикера — из catalog, «Ещё вырезки» — три свежие с текстом", async () => {
    const res = await app.inject({ method: "GET", url: `/api/news/articles/${YQUEM_ARTICLE}` });
    expect(res.statusCode).toBe(200);
    const article = zGetNewsArticleResponse.parse(res.json());
    expect(article.relatedWine).toEqual({ slug: "chateau-d-yquem-1988", name: "Château d’Yquem 1988" });
    expect(article.pullQuote).toMatchObject({ afterParagraph: 2 });
    expect(article.more.map((c) => c.slug)).toEqual([
      "vecher-klassika-starogo-sveta",
      "nachalsya-sbor-vinograda",
      "pogreb-otkryt-dlya-ekskursiy",
    ]);
  });

  it("статья из подшивки без текста — заглушка из дизайна", async () => {
    const article = zGetNewsArticleResponse.parse((await app.inject({ method: "GET", url: "/api/news/articles/tsvetenie-lozy" })).json());
    expect(article).toMatchObject({ kicker: "Урожай", body: ["[Текст статьи — его пришлёт редакция]"], relatedWine: null });
  });

  it("нет статьи — 404 в формате контракта", async () => {
    const res = await app.inject({ method: "GET", url: "/api/news/articles/net-takoy" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ code: "not_found", message: "Такой вырезки в подшивке нет" });
  });

  it("catalog недоступен — статья открывается без вина", async () => {
    const offline = await appWithCatalog("127.0.0.1:1", 300);
    const started = Date.now();
    const res = await offline.inject({ method: "GET", url: `/api/news/articles/${YQUEM_ARTICLE}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().relatedWine).toBeNull();
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it("catalog дольше дедлайна — не ждём его, статья без вина", async () => {
    const slow = await startFakeCatalog(2000);
    try {
      const impatient = await appWithCatalog(slow.url, 200);
      const started = Date.now();
      const res = await impatient.inject({ method: "GET", url: `/api/news/articles/${YQUEM_ARTICLE}` });
      expect(res.json().relatedWine).toBeNull();
      expect(Date.now() - started).toBeLessThan(1500);
    } finally {
      slow.stop();
    }
  });

  it("подшивка: месяц и рубрика, счётчики без учёта рубрики, неизвестный месяц — самый свежий", async () => {
    const harvest = zGetNewsArchiveResponse.parse(
      (await app.inject({ method: "GET", url: "/api/news/archive?month=2026-09&rubric=harvest" })).json()
    );
    expect(harvest.month).toBe("2026-09");
    expect(harvest.issues.map((i) => i.articleSlug)).toEqual(["pervyy-vinograd-v-chanakh"]);
    expect(harvest.months.find((m) => m.id === "2026-09")?.issuesCount).toBe(4);

    const fallback = zGetNewsArchiveResponse.parse((await app.inject({ method: "GET", url: "/api/news/archive?month=1999-01" })).json());
    expect(fallback.month).toBe("2026-10");
    expect(fallback.issues.map((i) => i.number)).toEqual([23, 22, 21]);
  });

  it("месяц не в формате YYYY-MM — 400", async () => {
    const res = await app.inject({ method: "GET", url: "/api/news/archive?month=октябрь" });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ code: "validation_failed", details: [{ path: "month" }] });
  });

  it("сид можно запускать повторно — данные не дублируются", async () => {
    await seedNews(prisma, async () => new Map());
    expect(await prisma.issue.count()).toBe(21);
    expect(await prisma.article.count()).toBe(22);
    expect(await prisma.issueStory.count()).toBe(3);
  });
});
