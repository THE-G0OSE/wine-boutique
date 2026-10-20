import { Controller, Get, Header } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetMyTastingsResponse } from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, CurrentUser } from "@wine/service-kit";
import { ListMyTastings } from "../application/tastings.js";
import { toTastingContract } from "./contract-mappers.js";

/** Дегустации в кабинете: шлюз пускает только вошедших и передаёт X-User-Id */
@Controller("me/tastings")
export class MeTastingsController {
  constructor(private readonly listMine: ListMyTastings) {}

  /** GET /api/me/tastings — operationId getMyTastings */
  @Get()
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetMyTastingsResponse)
  async list(@CurrentUser() userId: string | null): Promise<components["schemas"]["MyTastings"]> {
    if (!userId) throw new ApiError(401, "unauthorized", "Войдите, чтобы продолжить");
    const now = new Date();
    return (await this.listMine.execute(userId, now)).map(({ tasting, kind, guests }) => ({ tasting: toTastingContract(tasting, now), kind, guests }));
  }
}
