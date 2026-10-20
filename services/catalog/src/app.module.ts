import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { ListGrapeVarieties } from "./application/list-grape-varieties.js";
import { ListWines } from "./application/list-wines.js";
import { GetWineCard, GetWineFacets, ListShelves, SuggestSearch } from "./application/shop.js";
import { WineLookup } from "./application/wine-lookup.js";
import type { CatalogConfig } from "./config.js";
import { CatalogGrpcController } from "./grpc/catalog.grpc-controller.js";
import { GrapesController } from "./http/grapes.controller.js";
import { SearchController } from "./http/search.controller.js";
import { ShelvesController } from "./http/shelves.controller.js";
import { WinesController } from "./http/wines.controller.js";
import { CatalogPrisma } from "./infrastructure/prisma/catalog-prisma.js";
import { DatabaseModule } from "./infrastructure/prisma/database.module.js";

@Module({})
export class AppModule {
  static forRoot(config: CatalogConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [DatabaseModule],
            inject: [CatalogPrisma],
            useFactory: (prisma: CatalogPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        DatabaseModule,
      ],
      controllers: [WinesController, ShelvesController, SearchController, GrapesController, CatalogGrpcController],
      providers: [ListWines, ListShelves, GetWineFacets, GetWineCard, SuggestSearch, ListGrapeVarieties, WineLookup],
    };
  }
}
