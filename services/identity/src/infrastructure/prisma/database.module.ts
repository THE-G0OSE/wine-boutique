import { Module } from "@nestjs/common";
import { CodeSender, PhoneAuthRepository, ProfileRepository, SessionRepository } from "../../application/ports.js";
import { LogCodeSender } from "../log-code-sender.js";
import { IdentityPrisma } from "./identity-prisma.js";
import { PrismaPhoneAuthRepository } from "./prisma-phone-auth.repository.js";
import { PrismaProfileRepository } from "./prisma-profile.repository.js";
import { PrismaSessionRepository } from "./prisma-session.repository.js";

@Module({
  providers: [
    IdentityPrisma,
    { provide: SessionRepository, useClass: PrismaSessionRepository },
    { provide: PhoneAuthRepository, useClass: PrismaPhoneAuthRepository },
    { provide: ProfileRepository, useClass: PrismaProfileRepository },
    { provide: CodeSender, useClass: LogCodeSender },
  ],
  exports: [IdentityPrisma, SessionRepository, PhoneAuthRepository, ProfileRepository, CodeSender],
})
export class DatabaseModule {}
