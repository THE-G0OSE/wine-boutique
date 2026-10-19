import { Injectable } from "@nestjs/common";
import { GrapeVarietyRepository } from "../../application/ports.js";
import type { GrapeVariety } from "../../domain/grape-variety.js";
import { CatalogPrisma } from "./catalog-prisma.js";
import { toWine } from "./mappers.js";

@Injectable()
export class PrismaGrapeVarietyRepository extends GrapeVarietyRepository {
  constructor(private readonly prisma: CatalogPrisma) {
    super();
  }

  async listWithWines(): Promise<GrapeVariety[]> {
    const rows = await this.prisma.grapeVariety.findMany({
      orderBy: { position: "asc" },
      include: { wines: { orderBy: { position: "asc" }, include: { wine: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: row.type,
      origin: row.origin,
      taste: row.taste,
      harvest: row.harvest,
      description: row.description,
      plantation: row.plantation,
      imageUrl: row.imageUrl,
      wines: row.wines.map(({ wine }) => toWine(wine)),
    }));
  }
}
