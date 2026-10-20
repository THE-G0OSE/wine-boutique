import { Module } from "@nestjs/common";
import { LoyaltyRepository, WineCatalog } from "../application/ports.js";
import { GrpcWineCatalog } from "./catalog/grpc-wine-catalog.js";
import { LoyaltyPrisma } from "./prisma/loyalty-prisma.js";
import { PrismaLoyaltyRepository } from "./prisma/prisma-loyalty.repository.js";

/** Реализации портов loyalty: база и сосед catalog */
@Module({
  providers: [LoyaltyPrisma, { provide: LoyaltyRepository, useClass: PrismaLoyaltyRepository }, { provide: WineCatalog, useClass: GrpcWineCatalog }],
  exports: [LoyaltyPrisma, LoyaltyRepository, WineCatalog],
})
export class InfrastructureModule {}
