import { Body, Controller, Get, Header, HttpCode, Param, Post } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zCreateReservationBody, zCreateReservationResponse, zGetReservationPath, zGetReservationResponse } from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, CurrentUser, RateLimit, ValidationError } from "@wine/service-kit";
import type { z } from "zod";
import { CreateReservation, GetReservation } from "../application/reservations.js";
import { ReservationError } from "../domain/reservation.js";
import { toReservationContract } from "./contract-mappers.js";

const STATUS: Record<string, number> = { catalog_unavailable: 503, not_found: 404 };

@Controller("reservations")
export class ReservationsController {
  constructor(
    private readonly createReservation: CreateReservation,
    private readonly getReservation: GetReservation
  ) {}

  /** POST /api/reservations — operationId createReservation */
  @Post()
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_reservation", "Проверьте имя, телефон и отметьте обе галочки")
  @ContractResponse(zCreateReservationResponse)
  async create(
    @Body({ schema: zCreateReservationBody }) body: z.output<typeof zCreateReservationBody>,
    @CurrentUser() userId: string | null
  ): Promise<components["schemas"]["Reservation"]> {
    try {
      // Вошедший гость (необязательная сессия на шлюзе) — бронь попадёт в кабинет
      const { reservation, boutique } = await this.createReservation.execute({ ...body, userId });
      return toReservationContract(reservation, boutique);
    } catch (error) {
      if (error instanceof ReservationError) throw new ApiError(STATUS[error.code] ?? 422, error.code, error.message, error.details);
      throw error;
    }
  }

  /** GET /api/reservations/{id} — operationId getReservation */
  @Get(":id")
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetReservationResponse)
  async find(@Param({ schema: zGetReservationPath }) { id }: z.output<typeof zGetReservationPath>): Promise<components["schemas"]["Reservation"]> {
    const found = await this.getReservation.execute(id);
    if (!found) throw new ApiError(404, "not_found", "Такой брони нет");
    return toReservationContract(found.reservation, found.boutique);
  }
}
