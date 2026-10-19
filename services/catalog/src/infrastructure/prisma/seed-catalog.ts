import { grapeFixtures, wineFixtureList } from "@wine/demo-data";
import type { PrismaClient } from "./generated/client.js";

/** «0,75 л» → 750 */
const volumeMl = (volume: string) => Math.round(Number.parseFloat(volume.replace(",", ".")) * 1000);

/**
 * Данные из @wine/demo-data — те же, что отдают моки фронта. Повторный запуск безопасен:
 * вина и сорта обновляются по slug, вина сорта пересобираются.
 */
export const seedCatalog = async (prisma: PrismaClient, today = new Date()): Promise<{ wines: number; varieties: number }> => {
  const thisYear = today.getUTCFullYear();
  // «Новинки» в моке — по году урожая, свежие первыми; здесь та же очерёдность через дату поступления
  const byNewest = [...wineFixtureList].sort((a, b) => (b.vintage ?? -Infinity) - (a.vintage ?? -Infinity));
  const arrivedAt = (slug: string) =>
    new Date(Date.UTC(2026, 9, 1) - byNewest.findIndex((wine) => wine.slug === slug) * 86_400_000);

  for (const [rank, wine] of wineFixtureList.entries()) {
    const data = {
      name: wine.name,
      categories: wine.categories,
      region: wine.region,
      country: wine.country,
      grapes: wine.grapes,
      volumeMl: volumeMl(wine.volume),
      vintage: wine.vintage,
      cellaredAt: wine.cellarYears === null ? null : new Date(Date.UTC(thisYear - wine.cellarYears, 0, 1)),
      priceKopecks: wine.price === null ? null : wine.price * 100,
      imageUrl: wine.image,
      popularityRank: rank,
      arrivedAt: arrivedAt(wine.slug),
    };
    await prisma.wine.upsert({ where: { slug: wine.slug }, create: { slug: wine.slug, ...data }, update: data });
  }

  const wineIds = new Map(
    (await prisma.wine.findMany({ select: { id: true, slug: true } })).map((wine) => [wine.slug, wine.id])
  );

  for (const [position, { wines, image, id: _id, ...variety }] of grapeFixtures.entries()) {
    const data = { ...variety, imageUrl: image, position };
    const saved = await prisma.grapeVariety.upsert({ where: { slug: variety.slug }, create: data, update: data });
    await prisma.$transaction([
      prisma.grapeVarietyWine.deleteMany({ where: { varietyId: saved.id } }),
      prisma.grapeVarietyWine.createMany({
        data: wines.flatMap((wine, index) => {
          const wineId = wineIds.get(wine.slug);
          return wineId ? [{ varietyId: saved.id, wineId, position: index }] : [];
        }),
      }),
    ]);
  }

  return { wines: wineFixtureList.length, varieties: grapeFixtures.length };
};
