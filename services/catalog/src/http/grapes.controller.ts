import { Controller, Get, Header } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetGrapesResponse } from "@wine/contracts/openapi/zod";
import { ContractResponse } from "@wine/service-kit";
import { ListGrapeVarieties } from "../application/list-grape-varieties.js";
import { toGrapeVarietyContract } from "./contract-mappers.js";

@Controller("grapes")
export class GrapesController {
  constructor(private readonly listGrapeVarieties: ListGrapeVarieties) {}

  /** GET /api/grapes — operationId getGrapes */
  @Get()
  @Header("Cache-Control", "public, max-age=300")
  @ContractResponse(zGetGrapesResponse)
  async list(): Promise<components["schemas"]["GrapeVariety"][]> {
    const today = new Date();
    return (await this.listGrapeVarieties.execute()).map((variety) => toGrapeVarietyContract(variety, today));
  }
}
