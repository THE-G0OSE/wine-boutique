import { Controller, Get, Header, Query } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetShelvesQuery, zGetShelvesResponse } from "@wine/contracts/openapi/zod";
import { ContractResponse } from "@wine/service-kit";
import type { z } from "zod";
import { ListShelves } from "../application/shop.js";
import { toWineFilter, toWineSummary } from "./contract-mappers.js";

@Controller("shelves")
export class ShelvesController {
  constructor(private readonly listShelves: ListShelves) {}

  /** GET /api/shelves — operationId getShelves */
  @Get()
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetShelvesResponse)
  async list(@Query({ schema: zGetShelvesQuery }) query: z.output<typeof zGetShelvesQuery>): Promise<components["schemas"]["Shelf"][]> {
    const today = new Date();
    const { shelf: _shelf, ...filter } = toWineFilter(query);
    const shelves = await this.listShelves.execute(filter, query.limit, today);
    return shelves.map((shelf) => ({ ...shelf, wines: shelf.wines.map((wine) => toWineSummary(wine, today)) }));
  }
}
