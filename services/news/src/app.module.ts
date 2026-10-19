import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { ReadNews } from "./application/read-news.js";
import type { NewsConfig } from "./config.js";
import { NewsController } from "./http/news.controller.js";
import { InfrastructureModule } from "./infrastructure/infrastructure.module.js";
import { NewsPrisma } from "./infrastructure/prisma/news-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: NewsConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          // Готовность — только своя база: без catalog газета работает (без стикера вина)
          readiness: {
            imports: [InfrastructureModule],
            inject: [NewsPrisma],
            useFactory: (prisma: NewsPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        InfrastructureModule,
      ],
      controllers: [NewsController],
      providers: [ReadNews],
    };
  }
}
