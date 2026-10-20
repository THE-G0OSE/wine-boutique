import { Module } from "@nestjs/common";
import { RequestsRepository } from "../application/ports.js";
import { PrismaRequestsRepository } from "./prisma/prisma-requests-repository.js";
import { RequestsPrisma } from "./prisma/requests-prisma.js";

/** Реализации портов requests: база сервиса */
@Module({
  providers: [RequestsPrisma, { provide: RequestsRepository, useClass: PrismaRequestsRepository }],
  exports: [RequestsPrisma, RequestsRepository],
})
export class InfrastructureModule {}
