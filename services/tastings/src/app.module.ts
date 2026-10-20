import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { BookTasting, JoinWaitlist, ListTastings } from "./application/tastings.js";
import type { TastingsConfig } from "./config.js";
import { TastingsController } from "./http/tastings.controller.js";
import { InfrastructureModule } from "./infrastructure/infrastructure.module.js";
import { TastingsPrisma } from "./infrastructure/prisma/tastings-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: TastingsConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [InfrastructureModule],
            inject: [TastingsPrisma],
            useFactory: (prisma: TastingsPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        InfrastructureModule,
      ],
      controllers: [TastingsController],
      providers: [ListTastings, BookTasting, JoinWaitlist],
    };
  }
}
