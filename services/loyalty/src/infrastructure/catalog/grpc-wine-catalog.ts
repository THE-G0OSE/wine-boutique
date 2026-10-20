import { fileURLToPath } from "node:url";
import { Inject, Injectable, Logger, type OnModuleDestroy } from "@nestjs/common";
import { CATALOG_SERVICE_NAME, WINE_CATALOG_V1_PACKAGE_NAME, type GetWineSummariesResponse } from "@wine/contracts/proto/catalog";
import { GrpcClient, SERVICE_CONFIG } from "@wine/service-kit";
import { CatalogUnavailable, WineCatalog } from "../../application/ports.js";
import type { LoyaltyConfig } from "../../config.js";
import type { FavoriteWine } from "../../domain/loyalty.js";

/** catalog по gRPC: один пакетный вызов с дедлайном. Отказ соседа — CatalogUnavailable */
@Injectable()
export class GrpcWineCatalog extends WineCatalog implements OnModuleDestroy {
  private readonly logger = new Logger(GrpcWineCatalog.name);
  private readonly client: GrpcClient;

  constructor(@Inject(SERVICE_CONFIG) config: LoyaltyConfig) {
    super();
    this.client = new GrpcClient({
      protoPath: fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto")),
      package: WINE_CATALOG_V1_PACKAGE_NAME,
      service: CATALOG_SERVICE_NAME,
      url: config.CATALOG_GRPC_URL,
      timeoutMs: config.CATALOG_TIMEOUT_MS,
    });
  }

  async wines(ids: string[]): Promise<Map<string, FavoriteWine>> {
    if (ids.length === 0) return new Map();
    try {
      const { wines = [] } = await this.client.unary<GetWineSummariesResponse>("GetWineSummaries", { ids });
      return new Map(
        wines.map((wine) => [
          wine.id,
          {
            id: wine.id,
            slug: wine.slug,
            name: wine.name,
            categories: wine.categories ?? [],
            region: wine.region ?? "",
            country: wine.country ?? null,
            grapes: wine.grapes ?? [],
            volumeMl: wine.volumeMl ?? 750,
            vintage: wine.vintage ?? null,
            cellarYears: wine.cellarYears ?? null,
            priceKopecks: wine.priceKopecks ?? null,
            imageUrl: wine.imageUrl,
            bottle: wine.bottle || "red",
          },
        ])
      );
    } catch (error) {
      this.logger.warn(`catalog недоступен: ${error instanceof Error ? error.message : String(error)}`);
      throw new CatalogUnavailable();
    }
  }

  onModuleDestroy(): void {
    this.client.close();
  }
}
