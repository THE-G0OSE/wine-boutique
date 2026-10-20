import { Injectable } from "@nestjs/common";
import {
  WineRepository,
  type SearchTerms,
  type ShelfView,
  type WineCardView,
  type WineListQuery,
  type WinePage,
} from "../../application/ports.js";
import { cellaredRange, type FacetRow, type WineFilter } from "../../domain/catalog-filter.js";
import { searchWords, type Wine, type WineShelf, type WineSort } from "../../domain/wine.js";
import { CatalogPrisma } from "./catalog-prisma.js";
import type { Prisma } from "./generated/client.js";
import { toWine, toWineCard } from "./mappers.js";

/** Сортировки контракта. Вина без цены и года — в конце; при равенстве — по популярности (на полке — по порядку полки) */
const ORDER: Record<WineSort, Prisma.WineOrderByWithRelationInput[]> = {
  popular: [],
  price_asc: [{ priceKopecks: { sort: "asc", nulls: "last" } }],
  price_desc: [{ priceKopecks: { sort: "desc", nulls: "last" } }],
  vintage_asc: [{ vintage: { sort: "asc", nulls: "last" } }],
  new: [{ arrivedAt: "desc" }],
};

/**
 * Фильтр контракта → условие Prisma. Поиск — каждое слово подстрокой в нормализованном search_text
 * (триграммный индекс); цена в API — в рублях с округлением, в базе — в копейках.
 */
const whereOf = (filter: Omit<WineFilter, "shelf">, today: Date): Prisma.WineWhereInput => {
  const and: Prisma.WineWhereInput[] = [];
  if (filter.category) and.push({ categories: { has: filter.category } });
  for (const word of filter.q ? searchWords(filter.q) : []) and.push({ searchText: { contains: word } });
  if (filter.country?.length) and.push({ country: { in: filter.country } });
  if (filter.grape?.length) and.push({ grapes: { hasSome: filter.grape } });
  if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
    // Math.round(k / 100) ≥ min ⇔ k ≥ min·100 − 50; ≤ max ⇔ k ≤ max·100 + 49
    and.push({
      priceKopecks: {
        not: null,
        ...(filter.priceMin === undefined ? {} : { gte: filter.priceMin * 100 - 50 }),
        ...(filter.priceMax === undefined ? {} : { lte: filter.priceMax * 100 + 49 }),
      },
    });
  }
  if (filter.age?.length) {
    and.push({
      OR: filter.age.map((age) => {
        const { after, notAfter } = cellaredRange(age, today);
        return { cellaredAt: { not: null, lte: notAfter, ...(after ? { gt: after } : {}) } };
      }),
    });
  }
  if (filter.volumeMl?.length) and.push({ volumeMl: { in: filter.volumeMl } });
  return and.length ? { AND: and } : {};
};

@Injectable()
export class PrismaWineRepository extends WineRepository {
  constructor(private readonly prisma: CatalogPrisma) {
    super();
  }

  async list({ filter, sort, limit, offset, today }: WineListQuery): Promise<WinePage> {
    const { shelf, ...rest } = filter;
    const where = whereOf(rest, today);
    if (shelf) {
      // На полке popular — порядок полки, он же решает при равенстве
      const shelfWhere: Prisma.ShelfWineWhereInput = { shelfId: shelf, wine: where };
      const [rows, total] = await this.prisma.$transaction([
        this.prisma.shelfWine.findMany({
          where: shelfWhere,
          orderBy: [...ORDER[sort].map((order) => ({ wine: order })), { position: "asc" }],
          include: { wine: true },
          take: limit,
          skip: offset,
        }),
        this.prisma.shelfWine.count({ where: shelfWhere }),
      ]);
      return { items: rows.map(({ wine }) => toWine(wine)), total };
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.wine.findMany({ where, orderBy: [...ORDER[sort], { popularityRank: "asc" }, { id: "asc" }], take: limit, skip: offset }),
      this.prisma.wine.count({ where }),
    ]);
    return { items: rows.map(toWine), total };
  }

  async facetRows({ shelf, category, q }: Pick<WineFilter, "shelf" | "category" | "q">): Promise<FacetRow[]> {
    const where = whereOf({ category, q }, new Date());
    return this.prisma.wine.findMany({
      where: shelf ? { AND: [where, { shelves: { some: { shelfId: shelf } } }] } : where,
      select: { country: true, grapes: true, volumeMl: true, priceKopecks: true, cellaredAt: true },
    });
  }

  async shelves(filter: Omit<WineFilter, "shelf">, limit: number, today: Date): Promise<ShelfView[]> {
    const where = whereOf(filter, today);
    const shelves = await this.prisma.shelf.findMany({ orderBy: { position: "asc" } });
    return Promise.all(
      shelves.map(async ({ position: _position, ...shelf }) => {
        const shelfWhere: Prisma.ShelfWineWhereInput = { shelfId: shelf.id, wine: where };
        const [rows, total] = await this.prisma.$transaction([
          this.prisma.shelfWine.findMany({ where: shelfWhere, orderBy: { position: "asc" }, include: { wine: true }, take: limit }),
          this.prisma.shelfWine.count({ where: shelfWhere }),
        ]);
        return { ...shelf, total, wines: rows.map(({ wine }) => toWine(wine)) };
      })
    );
  }

  async findCard(slug: string): Promise<WineCardView | null> {
    const row = await this.prisma.wine.findUnique({
      where: { slug },
      include: {
        shelves: { include: { shelf: { select: { position: true } } } },
        related: { orderBy: { position: "asc" }, include: { related: true } },
      },
    });
    if (!row) return null;
    const { shelves, related, ...wine } = row;
    // Первая полка в порядке магазина; вина без полки в крошках — на красной, как в эталоне
    const primary = [...shelves].sort((a, b) => a.shelf.position - b.shelf.position)[0]?.shelfId ?? "red";
    return { card: toWineCard(wine), shelf: primary, related: related.map(({ related: other }) => toWine(other)) };
  }

  async shelfNeighbours(shelf: WineShelf, wineId: string, limit: number): Promise<Wine[]> {
    const rows = await this.prisma.shelfWine.findMany({
      where: { shelfId: shelf, wineId: { not: wineId } },
      orderBy: { position: "asc" },
      include: { wine: true },
      take: limit,
    });
    return rows.map(({ wine }) => toWine(wine));
  }

  async searchTerms(): Promise<SearchTerms> {
    // Первое появление сорта и региона по популярности вин — в таком порядке их показывают подсказки
    const [grapes, regions] = await Promise.all([
      this.prisma.$queryRaw<{ value: string }[]>`
        SELECT t.value FROM wines w, unnest(w.grapes) WITH ORDINALITY AS t(value, ord)
        GROUP BY t.value ORDER BY min(w.popularity_rank * 100 + t.ord), t.value`,
      this.prisma.$queryRaw<{ value: string }[]>`
        SELECT t.value FROM wines w, LATERAL (VALUES (w.region, 0), (w.country, 1)) AS t(value, ord)
        WHERE t.value IS NOT NULL
        GROUP BY t.value ORDER BY min(w.popularity_rank * 10 + t.ord), t.value`,
    ]);
    return { grapes: grapes.map(({ value }) => value), regions: regions.map(({ value }) => value) };
  }

  async findByIds(ids: string[]): Promise<Wine[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.wine.findMany({ where: { id: { in: ids } } });
    const byId = new Map(rows.map((row) => [row.id, toWine(row)]));
    return ids.flatMap((id) => byId.get(id) ?? []);
  }

  async resolveSlugs(slugs: string[]): Promise<Map<string, string>> {
    if (slugs.length === 0) return new Map();
    const rows = await this.prisma.wine.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
    return new Map(rows.map((row) => [row.slug, row.id]));
  }
}
