import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { CreateReservation, GetBoutiqueSlots, GetReservation, ListBoutiques } from "./application/reservations.js";
import type { ReservationsConfig } from "./config.js";
import { BoutiquesController } from "./http/boutiques.controller.js";
import { ReservationsController } from "./http/reservations.controller.js";
import { InfrastructureModule } from "./infrastructure/infrastructure.module.js";
import { ReservationsPrisma } from "./infrastructure/prisma/reservations-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: ReservationsConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [InfrastructureModule],
            inject: [ReservationsPrisma],
            useFactory: (prisma: ReservationsPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        InfrastructureModule,
      ],
      controllers: [BoutiquesController, ReservationsController],
      providers: [ListBoutiques, GetBoutiqueSlots, CreateReservation, GetReservation],
    };
  }
}
