import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { Favorites, GetLoyalty } from "./application/loyalty.js";
import type { LoyaltyConfig } from "./config.js";
import { LoyaltyController } from "./http/loyalty.controller.js";
import { InfrastructureModule } from "./infrastructure/infrastructure.module.js";
import { LoyaltyPrisma } from "./infrastructure/prisma/loyalty-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: LoyaltyConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [InfrastructureModule],
            inject: [LoyaltyPrisma],
            useFactory: (prisma: LoyaltyPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        InfrastructureModule,
      ],
      controllers: [LoyaltyController],
      providers: [GetLoyalty, Favorites],
    };
  }
}
