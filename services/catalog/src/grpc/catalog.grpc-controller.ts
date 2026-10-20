import { Controller } from "@nestjs/common";
import {
  CatalogServiceControllerMethods,
  type CatalogServiceController,
  type GetWineSummariesRequest,
  type GetWineSummariesResponse,
  type ResolveWineSlugsRequest,
  type ResolveWineSlugsResponse,
} from "@wine/contracts/proto/catalog";
import { WineLookup } from "../application/wine-lookup.js";
import { cellarYears } from "../domain/wine.js";

/** Внутренний API для других сервисов (wine.catalog.v1.CatalogService) */
@Controller()
@CatalogServiceControllerMethods()
export class CatalogGrpcController implements CatalogServiceController {
  constructor(private readonly lookup: WineLookup) {}

  async getWineSummaries({ ids }: GetWineSummariesRequest): Promise<GetWineSummariesResponse> {
    const wines = await this.lookup.summaries(ids ?? []);
    const today = new Date();
    return {
      wines: wines.map((wine) => ({
        id: wine.id,
        slug: wine.slug,
        name: wine.name,
        vintage: wine.vintage ?? undefined,
        priceKopecks: wine.priceKopecks ?? undefined,
        imageUrl: wine.imageUrl,
        categories: wine.categories,
        region: wine.region,
        country: wine.country ?? undefined,
        grapes: wine.grapes,
        volumeMl: wine.volumeMl,
        cellarYears: cellarYears(wine.cellaredAt, today) ?? undefined,
        bottle: wine.bottle,
      })),
    };
  }

  async resolveWineSlugs({ slugs }: ResolveWineSlugsRequest): Promise<ResolveWineSlugsResponse> {
    return { idsBySlug: Object.fromEntries(await this.lookup.resolveSlugs(slugs ?? [])) };
  }
}
