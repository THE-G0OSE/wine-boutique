import { Module } from "@nestjs/common";
import { BoutiqueRepository, ReservationRepository, WineCatalog } from "../application/ports.js";
import { GrpcWineCatalog } from "./catalog/grpc-wine-catalog.js";
import { PrismaBoutiqueRepository, PrismaReservationRepository } from "./prisma/prisma-repositories.js";
import { ReservationsPrisma } from "./prisma/reservations-prisma.js";

/** Реализации портов reservations: база и сосед catalog */
@Module({
  providers: [
    ReservationsPrisma,
    { provide: BoutiqueRepository, useClass: PrismaBoutiqueRepository },
    { provide: ReservationRepository, useClass: PrismaReservationRepository },
    { provide: WineCatalog, useClass: GrpcWineCatalog },
  ],
  exports: [ReservationsPrisma, BoutiqueRepository, ReservationRepository, WineCatalog],
})
export class InfrastructureModule {}
