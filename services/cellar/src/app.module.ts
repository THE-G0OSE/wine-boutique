import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { ListCells, RequestCell } from "./application/cells.js";
import type { CellarConfig } from "./config.js";
import { CellarController } from "./http/cellar.controller.js";
import { InfrastructureModule } from "./infrastructure/infrastructure.module.js";
import { CellarPrisma } from "./infrastructure/prisma/cellar-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: CellarConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [InfrastructureModule],
            inject: [CellarPrisma],
            useFactory: (prisma: CellarPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        InfrastructureModule,
      ],
      controllers: [CellarController],
      providers: [ListCells, RequestCell],
    };
  }
}
