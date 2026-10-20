import { arrivalRankOf, grapeFixtures, shelfFixtures, volumeMlOf, wineFixtureList } from "@wine/demo-data";
import { searchTextOf } from "../../domain/wine.js";
import { Prisma, type PrismaClient } from "./generated/client.js";

/**
 * Данные из @wine/demo-data — те же, что отдают моки фронта. Повторный запуск безопасен:
 * вина, полки и сорта обновляются по ключу, полки, пары и вина сорта пересобираются.
 */
export const seedCatalog = async (prisma: PrismaClient, today = new Date()): Promise<{ wines: number; shelves: number; varieties: number }> => {
  const thisYear = today.getUTCFullYear();
  // «Новинки» — по порядку поступления из эталона: самое свежее — 1 октября 2026, каждое следующее — днём раньше
  const arrivedAt = (slug: string) => new Date(Date.UTC(2026, 9, 1) - arrivalRankOf(slug) * 86_400_000);

  for (const [rank, wine] of wineFixtureList.entries()) {
    const data = {
      name: wine.name,
      categories: wine.categories,
      region: wine.region,
      country: wine.country,
      grapes: wine.grapes,
      volumeMl: volumeMlOf(wine.volume),
      vintage: wine.vintage,
      cellaredAt: wine.cellarYears === null ? null : new Date(Date.UTC(thisYear - wine.cellarYears, 0, 1)),
      priceKopecks: wine.price === null ? null : wine.price * 100,
      imageUrl: wine.image,
      popularityRank: rank,
      arrivedAt: arrivedAt(wine.slug),
      bottle: wine.bottle,
      producer: wine.producer,
      appellation: wine.appellation,
      abv: wine.abv,
      aging: wine.aging,
      potential: wine.potential,
      badges: wine.badges,
      // null в JSON-колонке — именно SQL NULL: «не описано»
      profile: wine.profile ?? Prisma.DbNull,
      notes: wine.notes,
      food: wine.food,
      serve: wine.serve ?? Prisma.DbNull,
      sommelierNote: wine.sommelierNote,
      searchText: searchTextOf(wine),
    };
    await prisma.wine.upsert({ where: { slug: wine.slug }, create: { slug: wine.slug, ...data }, update: data });
  }

  const wineIds = new Map(
    (await prisma.wine.findMany({ select: { id: true, slug: true } })).map((wine) => [wine.slug, wine.id])
  );
  const idsOf = (slugs: string[]) => slugs.flatMap((slug) => wineIds.get(slug) ?? []);

  for (const [position, { slugs, ...shelf }] of shelfFixtures.entries()) {
    const data = { ...shelf, position };
    await prisma.shelf.upsert({ where: { id: shelf.id }, create: data, update: data });
    await prisma.$transaction([
      prisma.shelfWine.deleteMany({ where: { shelfId: shelf.id } }),
      prisma.shelfWine.createMany({ data: idsOf(slugs).map((wineId, index) => ({ shelfId: shelf.id, wineId, position: index })) }),
    ]);
  }

  for (const wine of wineFixtureList) {
    const wineId = wineIds.get(wine.slug)!;
    await prisma.$transaction([
      prisma.wineRelation.deleteMany({ where: { wineId } }),
      prisma.wineRelation.createMany({ data: idsOf(wine.relatedSlugs).map((relatedId, position) => ({ wineId, relatedId, position })) }),
    ]);
  }

  for (const [position, { wines, image, id: _id, ...variety }] of grapeFixtures.entries()) {
    const data = { ...variety, imageUrl: image, position };
    const saved = await prisma.grapeVariety.upsert({ where: { slug: variety.slug }, create: data, update: data });
    await prisma.$transaction([
      prisma.grapeVarietyWine.deleteMany({ where: { varietyId: saved.id } }),
      prisma.grapeVarietyWine.createMany({
        data: idsOf(wines.map((wine) => wine.slug)).map((wineId, index) => ({ varietyId: saved.id, wineId, position: index })),
      }),
    ]);
  }

  return { wines: wineFixtureList.length, shelves: shelfFixtures.length, varieties: grapeFixtures.length };
};
