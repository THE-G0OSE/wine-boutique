import { fileURLToPath } from "node:url";
import { Inject, Injectable, Logger, type OnModuleDestroy } from "@nestjs/common";
import { CATALOG_SERVICE_NAME, WINE_CATALOG_V1_PACKAGE_NAME, type GetWineSummariesResponse } from "@wine/contracts/proto/catalog";
import { GrpcClient, SERVICE_CONFIG } from "@wine/service-kit";
import { WineCatalog, type WineRef } from "../../application/ports.js";
import type { NewsConfig } from "../../config.js";

/** catalog по gRPC: один пакетный вызов с дедлайном; отказ соседа — пустой ответ и предупреждение в логе */
@Injectable()
export class GrpcWineCatalog extends WineCatalog implements OnModuleDestroy {
  private readonly logger = new Logger(GrpcWineCatalog.name);
  private readonly client: GrpcClient;

  constructor(@Inject(SERVICE_CONFIG) config: NewsConfig) {
    super();
    this.client = new GrpcClient({
      protoPath: fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto")),
      package: WINE_CATALOG_V1_PACKAGE_NAME,
      service: CATALOG_SERVICE_NAME,
      url: config.CATALOG_GRPC_URL,
      timeoutMs: config.CATALOG_TIMEOUT_MS,
    });
  }

  async wineRefs(ids: string[]): Promise<Map<string, WineRef>> {
    if (ids.length === 0) return new Map();
    try {
      const { wines = [] } = await this.client.unary<GetWineSummariesResponse>("GetWineSummaries", { ids });
      return new Map(wines.map((wine) => [wine.id, { slug: wine.slug, name: wine.name }]));
    } catch (error) {
      this.logger.warn(`catalog недоступен, вина не дочитаны: ${error instanceof Error ? error.message : String(error)}`);
      return new Map();
    }
  }

  onModuleDestroy(): void {
    this.client.close();
  }
}
