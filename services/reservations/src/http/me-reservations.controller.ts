import { Controller, Get, Header, HttpCode, Param, Post } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import {
  zCancelMyReservationPath,
  zCancelMyReservationResponse,
  zExtendMyReservationPath,
  zExtendMyReservationResponse,
  zGetMyReservationsResponse,
} from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, CurrentUser } from "@wine/service-kit";
import type { z } from "zod";
import { ListMyReservations, ManageMyReservation } from "../application/reservations.js";
import { ReservationError } from "../domain/reservation.js";
import { toMyReservationContract, toReservationContract } from "./contract-mappers.js";

type Schemas = components["schemas"];

const STATUS: Record<string, number> = { not_found: 404, cannot_extend: 409, cannot_cancel: 409 };

const requireUser = (userId: string | null): string => {
  if (!userId) throw new ApiError(401, "unauthorized", "Войдите, чтобы продолжить");
  return userId;
};

const guard = async <T>(run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    if (error instanceof ReservationError) throw new ApiError(STATUS[error.code] ?? 422, error.code, error.message);
    throw error;
  }
};

/** Брони в кабинете: шлюз пускает только вошедших (require-session) и передаёт X-User-Id */
@Controller("me/reservations")
export class MeReservationsController {
  constructor(
    private readonly listMine: ListMyReservations,
    private readonly manage: ManageMyReservation
  ) {}

  /** GET /api/me/reservations — operationId getMyReservations */
  @Get()
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetMyReservationsResponse)
  async list(@CurrentUser() userId: string | null): Promise<Schemas["MyReservations"]> {
    const { active, history } = await this.listMine.execute(requireUser(userId));
    return {
      active: active.map(({ reservation, boutique }) => toMyReservationContract(reservation, boutique)),
      history: history.map(({ reservation, boutique }) => toMyReservationContract(reservation, boutique)),
    };
  }

  /** POST /api/me/reservations/{id}/extend — operationId extendMyReservation */
  @Post(":id/extend")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  @ContractResponse(zExtendMyReservationResponse)
  async extend(
    @CurrentUser() userId: string | null,
    @Param({ schema: zExtendMyReservationPath }) { id }: z.output<typeof zExtendMyReservationPath>
  ): Promise<Schemas["Reservation"]> {
    const { reservation, boutique } = await guard(() => this.manage.extend(id, requireUser(userId)));
    return toReservationContract(reservation, boutique);
  }

  /** POST /api/me/reservations/{id}/cancel — operationId cancelMyReservation */
  @Post(":id/cancel")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  @ContractResponse(zCancelMyReservationResponse)
  async cancel(
    @CurrentUser() userId: string | null,
    @Param({ schema: zCancelMyReservationPath }) { id }: z.output<typeof zCancelMyReservationPath>
  ): Promise<Schemas["Reservation"]> {
    const { reservation, boutique } = await guard(() => this.manage.cancel(id, requireUser(userId)));
    return toReservationContract(reservation, boutique);
  }
}
