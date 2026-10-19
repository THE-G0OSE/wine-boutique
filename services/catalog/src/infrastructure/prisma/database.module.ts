import { Module } from "@nestjs/common";
import { GrapeVarietyRepository, WineRepository } from "../../application/ports.js";
import { CatalogPrisma } from "./catalog-prisma.js";
import { PrismaGrapeVarietyRepository } from "./prisma-grape-variety.repository.js";
import { PrismaWineRepository } from "./prisma-wine.repository.js";

/** Хранилище catalog: клиент Prisma и реализации портов application */
@Module({
  providers: [
    CatalogPrisma,
    { provide: WineRepository, useClass: PrismaWineRepository },
    { provide: GrapeVarietyRepository, useClass: PrismaGrapeVarietyRepository },
  ],
  exports: [CatalogPrisma, WineRepository, GrapeVarietyRepository],
})
export class DatabaseModule {}
