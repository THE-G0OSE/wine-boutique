import { Body, Controller, Get, Header, HttpCode, Post } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zCreateCellarRequestBody, zCreateCellarRequestResponse, zGetCellarCellsResponse } from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, RateLimit, ValidationError } from "@wine/service-kit";
import type { z } from "zod";
import { ListCells, RequestCell } from "../application/cells.js";
import { CellarError, type Cell } from "../domain/cell.js";

type Schemas = components["schemas"];

const INVALID = "Проверьте имя, телефон и выбранную ячейку";

const toCellContract = ({ position: _position, priceKopecks, ...cell }: Cell): Schemas["CellarCell"] => ({
  ...cell,
  pricePerMonth: priceKopecks === null ? null : Math.round(priceKopecks / 100),
});

@Controller("cellar")
export class CellarController {
  constructor(
    private readonly listCells: ListCells,
    private readonly requestCell: RequestCell
  ) {}

  /** GET /api/cellar/cells — operationId getCellarCells: занятость меняется с договорами — не кэшируем */
  @Get("cells")
  @Header("Cache-Control", "no-store")
  @ContractResponse(zGetCellarCellsResponse)
  async cells(): Promise<Schemas["CellarCell"][]> {
    return (await this.listCells.execute()).map(toCellContract);
  }

  /** POST /api/cellar/requests — operationId createCellarRequest */
  @Post("requests")
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_request", INVALID)
  @ContractResponse(zCreateCellarRequestResponse)
  async request(@Body({ schema: zCreateCellarRequestBody }) body: z.output<typeof zCreateCellarRequestBody>): Promise<Schemas["CellarRequest"]> {
    try {
      return await this.requestCell.execute(body);
    } catch (error) {
      if (error instanceof CellarError) throw new ApiError(error.code === "cell_busy" ? 409 : 422, error.code, error.message);
      throw error;
    }
  }
}
