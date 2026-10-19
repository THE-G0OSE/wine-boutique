import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { Letters, Moderation } from "./application/letters.js";
import type { ReviewsConfig } from "./config.js";
import { ReviewsController } from "./http/reviews.controller.js";
import { DatabaseModule } from "./infrastructure/prisma/database.module.js";
import { ReviewsPrisma } from "./infrastructure/prisma/reviews-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: ReviewsConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [DatabaseModule],
            inject: [ReviewsPrisma],
            useFactory: (prisma: ReviewsPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        DatabaseModule,
      ],
      controllers: [ReviewsController],
      providers: [Letters, Moderation],
      exports: [Moderation],
    };
  }
}
