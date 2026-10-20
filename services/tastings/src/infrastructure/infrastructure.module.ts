import { Module } from "@nestjs/common";
import { TastingRepository } from "../application/ports.js";
import { PrismaTastingRepository } from "./prisma/prisma-tasting-repository.js";
import { TastingsPrisma } from "./prisma/tastings-prisma.js";

/** Реализации портов tastings: база сервиса */
@Module({
  providers: [TastingsPrisma, { provide: TastingRepository, useClass: PrismaTastingRepository }],
  exports: [TastingsPrisma, TastingRepository],
})
export class InfrastructureModule {}
