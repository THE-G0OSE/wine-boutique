import { Module } from "@nestjs/common";
import { CellRepository } from "../application/ports.js";
import { CellarPrisma } from "./prisma/cellar-prisma.js";
import { PrismaCellRepository } from "./prisma/prisma-cell-repository.js";

/** Реализации портов cellar: база сервиса */
@Module({
  providers: [CellarPrisma, { provide: CellRepository, useClass: PrismaCellRepository }],
  exports: [CellarPrisma, CellRepository],
})
export class InfrastructureModule {}
