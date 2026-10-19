import { Module } from "@nestjs/common";
import { NewsRepository, WineCatalog } from "../application/ports.js";
import { GrpcWineCatalog } from "./catalog/grpc-wine-catalog.js";
import { NewsPrisma } from "./prisma/news-prisma.js";
import { PrismaNewsRepository } from "./prisma/prisma-news.repository.js";

/** Реализации портов news: база и сосед catalog */
@Module({
  providers: [
    NewsPrisma,
    { provide: NewsRepository, useClass: PrismaNewsRepository },
    { provide: WineCatalog, useClass: GrpcWineCatalog },
  ],
  exports: [NewsPrisma, NewsRepository, WineCatalog],
})
export class InfrastructureModule {}
