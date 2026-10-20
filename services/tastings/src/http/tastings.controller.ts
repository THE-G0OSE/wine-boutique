import { Body, Controller, Get, Header, HttpCode, Param, Post, Query } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import {
  zCreateTastingBookingBody,
  zCreateTastingBookingPath,
  zCreateTastingBookingResponse,
  zGetTastingsQuery,
  zGetTastingsResponse,
  zJoinTastingWaitlistBody,
  zJoinTastingWaitlistPath,
} from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, RateLimit, ValidationError } from "@wine/service-kit";
import type { z } from "zod";
import { BookTasting, JoinWaitlist, ListTastings } from "../application/tastings.js";
import { TastingError } from "../domain/tasting.js";
import { toTastingContract } from "./contract-mappers.js";

const STATUS: Record<string, number> = { invalid_booking: 422, not_found: 404 };

const toApiError = (error: unknown) =>
  error instanceof TastingError ? new ApiError(STATUS[error.code] ?? 409, error.code, error.message, error.details) : error;

const INVALID = "Проверьте имя и телефон и отметьте согласие";

@Controller("tastings")
export class TastingsController {
  constructor(
    private readonly listTastings: ListTastings,
    private readonly bookTasting: BookTasting,
    private readonly joinWaitlist: JoinWaitlist
  ) {}

  /** GET /api/tastings?month= — operationId getTastings: места меняются с каждой записью — не кэшируем */
  @Get()
  @Header("Cache-Control", "no-store")
  @ContractResponse(zGetTastingsResponse)
  async list(@Query({ schema: zGetTastingsQuery }) { month }: z.output<typeof zGetTastingsQuery>): Promise<components["schemas"]["Tasting"][]> {
    const now = new Date();
    return (await this.listTastings.execute(month)).map((tasting) => toTastingContract(tasting, now));
  }

  /** POST /api/tastings/{id}/bookings — operationId createTastingBooking */
  @Post(":id/bookings")
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_booking", INVALID)
  @ContractResponse(zCreateTastingBookingResponse)
  async book(
    @Param({ schema: zCreateTastingBookingPath }) { id }: z.output<typeof zCreateTastingBookingPath>,
    @Body({ schema: zCreateTastingBookingBody }) body: z.output<typeof zCreateTastingBookingBody>
  ): Promise<components["schemas"]["TastingBooking"]> {
    try {
      const now = new Date();
      const booked = await this.bookTasting.execute(id, body, now);
      return { id: booked.bookingId, tasting: toTastingContract(booked.tasting, now), guests: booked.guests, customerName: booked.customerName };
    } catch (error) {
      throw toApiError(error);
    }
  }

  /** POST /api/tastings/{id}/waitlist — operationId joinTastingWaitlist */
  @Post(":id/waitlist")
  @HttpCode(204)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_booking", INVALID)
  async wait(
    @Param({ schema: zJoinTastingWaitlistPath }) { id }: z.output<typeof zJoinTastingWaitlistPath>,
    @Body({ schema: zJoinTastingWaitlistBody }) body: z.output<typeof zJoinTastingWaitlistBody>
  ): Promise<void> {
    try {
      await this.joinWaitlist.execute(id, body);
    } catch (error) {
      throw toApiError(error);
    }
  }
}
