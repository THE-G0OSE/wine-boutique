import { Module } from "@nestjs/common";
import { SessionRepository } from "../../application/ports.js";
import { IdentityPrisma } from "./identity-prisma.js";
import { PrismaSessionRepository } from "./prisma-session.repository.js";

@Module({
  providers: [IdentityPrisma, { provide: SessionRepository, useClass: PrismaSessionRepository }],
  exports: [IdentityPrisma, SessionRepository],
})
export class DatabaseModule {}
