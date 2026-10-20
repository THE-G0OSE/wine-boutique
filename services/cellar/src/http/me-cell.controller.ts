import { Body, Controller, Get, Header, HttpCode, Post } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetMyCellResponse, zPrepareMyCellBody, zPrepareMyCellResponse } from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, CurrentUser, ValidationError } from "@wine/service-kit";
import type { z } from "zod";
import { MyCellUseCase } from "../application/cells.js";
import { CELLAR_CONDITIONS, CellarError } from "../domain/cell.js";

type Schemas = components["schemas"];

const requireUser = (userId: string | null): string => {
  if (!userId) throw new ApiError(401, "unauthorized", "Войдите, чтобы продолжить");
  return userId;
};

/** Моя ячейка в кабинете: шлюз пускает только вошедших и передаёт X-User-Id */
@Controller("me/cell")
export class MeCellController {
  constructor(private readonly myCell: MyCellUseCase) {}

  /** GET /api/me/cell — operationId getMyCell */
  @Get()
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetMyCellResponse)
  async get(@CurrentUser() userId: string | null): Promise<Schemas["MyCellResponse"]> {
    const mine = await this.myCell.get(requireUser(userId));
    if (!mine) return { cell: null };
    return {
      cell: {
        number: mine.cell.number,
        tier: mine.cell.tier,
        capacity: mine.cell.capacity,
        paidUntil: mine.paidUntil,
        conditions: CELLAR_CONDITIONS,
        bottles: mine.bottles.map(({ imageUrl, ...bottle }) => ({ ...bottle, image: imageUrl })),
        preparation: mine.preparation ? { bottleIds: mine.preparation.bottleIds, visitAt: mine.preparation.visitAt.toISOString() } : null,
      },
    };
  }

  /** POST /api/me/cell/prepare — operationId prepareMyCell */
  @Post("prepare")
  @HttpCode(202)
  @Header("Cache-Control", "no-store")
  @ValidationError("invalid_preparation", "Отметьте бутылки и время визита")
  @ContractResponse(zPrepareMyCellResponse)
  async prepare(
    @CurrentUser() userId: string | null,
    @Body({ schema: zPrepareMyCellBody }) body: z.output<typeof zPrepareMyCellBody>
  ): Promise<Schemas["CellPreparation"]> {
    try {
      await this.myCell.prepare(requireUser(userId), body.bottleIds, new Date(body.visitAt));
      return { bottleIds: body.bottleIds, visitAt: new Date(body.visitAt).toISOString() };
    } catch (error) {
      if (error instanceof CellarError) throw new ApiError(error.code === "not_found" ? 404 : 422, error.code, error.message);
      throw error;
    }
  }
}
