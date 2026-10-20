import { Controller, Get, Header, Param } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetBoutiqueSlotsPath, zGetBoutiqueSlotsResponse, zGetBoutiquesResponse } from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse } from "@wine/service-kit";
import type { z } from "zod";
import { GetBoutiqueSlots, ListBoutiques } from "../application/reservations.js";
import { toBoutiqueContract } from "./contract-mappers.js";

@Controller("boutiques")
export class BoutiquesController {
  constructor(
    private readonly listBoutiques: ListBoutiques,
    private readonly getSlots: GetBoutiqueSlots
  ) {}

  /** GET /api/boutiques — operationId getBoutiques */
  @Get()
  @Header("Cache-Control", "public, max-age=300")
  @ContractResponse(zGetBoutiquesResponse)
  async list(): Promise<components["schemas"]["Boutique"][]> {
    return (await this.listBoutiques.execute()).map(toBoutiqueContract);
  }

  /** GET /api/boutiques/{id}/slots — operationId getBoutiqueSlots: свободное время меняется каждую минуту — не кэшируем */
  @Get(":id/slots")
  @Header("Cache-Control", "no-store")
  @ContractResponse(zGetBoutiqueSlotsResponse)
  async slots(@Param({ schema: zGetBoutiqueSlotsPath }) { id }: z.output<typeof zGetBoutiqueSlotsPath>): Promise<components["schemas"]["PickupDay"][]> {
    const days = await this.getSlots.execute(id);
    if (!days) throw new ApiError(404, "not_found", "Такого бутика нет");
    return days;
  }
}
