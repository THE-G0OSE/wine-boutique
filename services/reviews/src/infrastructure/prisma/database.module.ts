import { Module } from "@nestjs/common";
import { LetterRepository } from "../../application/ports.js";
import { PrismaLetterRepository } from "./prisma-letter.repository.js";
import { ReviewsPrisma } from "./reviews-prisma.js";

/** Хранилище reviews: клиент Prisma и реализация порта application */
@Module({
  providers: [ReviewsPrisma, { provide: LetterRepository, useClass: PrismaLetterRepository }],
  exports: [ReviewsPrisma, LetterRepository],
})
export class DatabaseModule {}
