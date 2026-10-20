import { fileURLToPath } from "node:url";
import { Inject, Injectable, Logger, type OnModuleDestroy } from "@nestjs/common";
import { CATALOG_SERVICE_NAME, WINE_CATALOG_V1_PACKAGE_NAME, type GetWineSummariesResponse } from "@wine/contracts/proto/catalog";
import { GrpcClient, SERVICE_CONFIG } from "@wine/service-kit";
import { CatalogUnavailable, WineCatalog, type WineSnapshot } from "../../application/ports.js";
import type { ReservationsConfig } from "../../config.js";

/** catalog по gRPC: один пакетный вызов с дедлайном. Отказ соседа — CatalogUnavailable (бронь без проверки не создаём) */
@Injectable()
export class GrpcWineCatalog extends WineCatalog implements OnModuleDestroy {
  private readonly logger = new Logger(GrpcWineCatalog.name);
  private readonly client: GrpcClient;

  constructor(@Inject(SERVICE_CONFIG) config: ReservationsConfig) {
    super();
    this.client = new GrpcClient({
      protoPath: fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto")),
      package: WINE_CATALOG_V1_PACKAGE_NAME,
      service: CATALOG_SERVICE_NAME,
      url: config.CATALOG_GRPC_URL,
      timeoutMs: config.CATALOG_TIMEOUT_MS,
    });
  }

  async snapshots(ids: string[]): Promise<Map<string, WineSnapshot>> {
    if (ids.length === 0) return new Map();
    try {
      const { wines = [] } = await this.client.unary<GetWineSummariesResponse>("GetWineSummaries", { ids });
      return new Map(
        wines.map((wine) => [
          wine.id,
          { id: wine.id, slug: wine.slug, name: wine.name, imageUrl: wine.imageUrl, priceKopecks: wine.priceKopecks ?? null },
        ])
      );
    } catch (error) {
      this.logger.warn(`catalog недоступен, бронь не создана: ${error instanceof Error ? error.message : String(error)}`);
      throw new CatalogUnavailable();
    }
  }

  onModuleDestroy(): void {
    this.client.close();
  }
}
