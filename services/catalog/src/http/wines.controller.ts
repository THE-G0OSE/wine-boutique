import { Controller, Get, Header, Param, Query } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import {
  zGetWineFacetsQuery,
  zGetWineFacetsResponse,
  zGetWinePath,
  zGetWineResponse,
  zGetWinesQuery,
  zGetWinesResponse,
} from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse } from "@wine/service-kit";
import type { z } from "zod";
import { ListWines } from "../application/list-wines.js";
import { GetWineCard, GetWineFacets } from "../application/shop.js";
import { toWineDetails, toWineFilter, toWineSummary } from "./contract-mappers.js";

type Schemas = components["schemas"];

@Controller("wines")
export class WinesController {
  constructor(
    private readonly listWines: ListWines,
    private readonly getWineFacets: GetWineFacets,
    private readonly getWineCard: GetWineCard
  ) {}

  /** GET /api/wines — operationId getWines */
  @Get()
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetWinesResponse)
  async list(@Query({ schema: zGetWinesQuery }) query: z.output<typeof zGetWinesQuery>): Promise<Schemas["WinePage"]> {
    const today = new Date();
    const page = await this.listWines.execute({
      filter: toWineFilter(query),
      sort: query.sort ?? "popular",
      limit: query.limit,
      offset: query.offset,
      today,
    });
    return { items: page.items.map((wine) => toWineSummary(wine, today)), total: page.total };
  }

  /** GET /api/wines/facets — operationId getWineFacets */
  @Get("facets")
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetWineFacetsResponse)
  facets(@Query({ schema: zGetWineFacetsQuery }) query: z.output<typeof zGetWineFacetsQuery>): Promise<Schemas["WineFacets"]> {
    return this.getWineFacets.execute(toWineFilter(query));
  }

  /** GET /api/wines/{slug} — operationId getWine */
  @Get(":slug")
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetWineResponse)
  async card(@Param({ schema: zGetWinePath }) { slug }: z.output<typeof zGetWinePath>): Promise<Schemas["WineDetails"]> {
    const view = await this.getWineCard.execute(slug);
    if (!view) throw new ApiError(404, "not_found", "Такого вина на полках нет");
    return toWineDetails(view, new Date());
  }
}
