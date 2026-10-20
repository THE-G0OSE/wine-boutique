import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { GetMonthlyCrates, IssueCertificate, RequestGifts, RequestHall, SubscribeMonthly } from "./application/requests.js";
import type { RequestsConfig } from "./config.js";
import { RequestsController } from "./http/requests.controller.js";
import { InfrastructureModule } from "./infrastructure/infrastructure.module.js";
import { RequestsPrisma } from "./infrastructure/prisma/requests-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: RequestsConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [InfrastructureModule],
            inject: [RequestsPrisma],
            useFactory: (prisma: RequestsPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        InfrastructureModule,
      ],
      controllers: [RequestsController],
      providers: [RequestHall, RequestGifts, GetMonthlyCrates, SubscribeMonthly, IssueCertificate],
    };
  }
}
