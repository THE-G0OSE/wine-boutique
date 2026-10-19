import { Controller, Get, Header, Query } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetWinesQuery, zGetWinesResponse } from "@wine/contracts/openapi/zod";
import { ContractResponse } from "@wine/service-kit";
import type { z } from "zod";
import { ListWines } from "../application/list-wines.js";
import { toWineSummary } from "./contract-mappers.js";

@Controller("wines")
export class WinesController {
  constructor(private readonly listWines: ListWines) {}

  /** GET /api/wines — operationId getWines */
  @Get()
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetWinesResponse)
  async list(@Query({ schema: zGetWinesQuery }) query: z.output<typeof zGetWinesQuery>): Promise<components["schemas"]["WinePage"]> {
    const page = await this.listWines.execute({
      category: query.category,
      sort: query.sort ?? "popular",
      limit: query.limit,
      offset: query.offset,
    });
    const today = new Date();
    return { items: page.items.map((wine) => toWineSummary(wine, today)), total: page.total };
  }
}
