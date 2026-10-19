/**
 * Наполнение базы news демо-данными из макетов (однократно при первом запуске):
 *   DATABASE_URL=… CATALOG_GRPC_URL=catalog:50051 node dist/seed.js
 * Вина статей (стикер «Забронировать») — по slug через catalog; catalog недоступен — без вин.
 */
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATALOG_SERVICE_NAME, WINE_CATALOG_V1_PACKAGE_NAME, type ResolveWineSlugsResponse } from "@wine/contracts/proto/catalog";
import { GrpcClient } from "@wine/service-kit";
import { PrismaClient } from "./infrastructure/prisma/generated/client.js";
import { seedNews } from "./infrastructure/prisma/seed-news.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Нужна переменная DATABASE_URL");

const catalog = new GrpcClient({
  protoPath: fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto")),
  package: WINE_CATALOG_V1_PACKAGE_NAME,
  service: CATALOG_SERVICE_NAME,
  url: process.env.CATALOG_GRPC_URL ?? "catalog:50051",
  timeoutMs: 5000,
});

const resolveWineSlugs = async (slugs: string[]) => {
  try {
    const { idsBySlug = {} } = await catalog.unary<ResolveWineSlugsResponse>("ResolveWineSlugs", { slugs });
    return new Map(Object.entries(idsBySlug));
  } catch (error) {
    console.warn(`catalog недоступен — статьи сохранятся без вин: ${error instanceof Error ? error.message : error}`);
    return new Map<string, string>();
  }
};

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const { issues, articles, linkedWines } = await seedNews(prisma, resolveWineSlugs);
  console.log(`news: ${issues} выпусков, ${articles} статей, вин из catalog: ${linkedWines}`);
} finally {
  catalog.close();
  await prisma.$disconnect();
}
