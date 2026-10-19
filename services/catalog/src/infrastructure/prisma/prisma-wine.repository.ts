import { Injectable } from "@nestjs/common";
import { WineRepository, type WineListQuery, type WinePage } from "../../application/ports.js";
import type { Wine, WineSort } from "../../domain/wine.js";
import { CatalogPrisma } from "./catalog-prisma.js";
import type { Prisma } from "./generated/client.js";
import { toWine } from "./mappers.js";

/** Сортировки контракта. Вина без цены и года — в конце; при равенстве — по популярности, затем по id */
const ORDER: Record<WineSort, Prisma.WineOrderByWithRelationInput[]> = {
  popular: [{ popularityRank: "asc" }],
  price_asc: [{ priceKopecks: { sort: "asc", nulls: "last" } }, { popularityRank: "asc" }],
  price_desc: [{ priceKopecks: { sort: "desc", nulls: "last" } }, { popularityRank: "asc" }],
  vintage_asc: [{ vintage: { sort: "asc", nulls: "last" } }, { popularityRank: "asc" }],
  new: [{ arrivedAt: "desc" }, { popularityRank: "asc" }],
};

@Injectable()
export class PrismaWineRepository extends WineRepository {
  constructor(private readonly prisma: CatalogPrisma) {
    super();
  }

  async list({ category, sort, limit, offset }: WineListQuery): Promise<WinePage> {
    const where: Prisma.WineWhereInput = category ? { categories: { has: category } } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.wine.findMany({ where, orderBy: [...ORDER[sort], { id: "asc" }], take: limit, skip: offset }),
      this.prisma.wine.count({ where }),
    ]);
    return { items: rows.map(toWine), total };
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
