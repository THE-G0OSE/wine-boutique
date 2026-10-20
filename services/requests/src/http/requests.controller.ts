import { Body, Controller, Get, Header, HttpCode, Post } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import {
  zCreateCertificateBody,
  zCreateCertificateResponse,
  zCreateGiftRequestBody,
  zCreateGiftRequestResponse,
  zCreateHallRequestBody,
  zCreateHallRequestResponse,
  zCreateMonthlySubscriptionBody,
  zCreateMonthlySubscriptionResponse,
  zGetMonthlyCratesResponse,
} from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, CurrentUser, RateLimit, ValidationError } from "@wine/service-kit";
import type { z } from "zod";
import { GetMonthlyCrates, IssueCertificate, RequestGifts, RequestHall, SubscribeMonthly } from "../application/requests.js";
import { certificateSerial, InvalidRequest, requestNumber } from "../domain/requests.js";

type Schemas = components["schemas"];

const INVALID = "Проверьте поля заявки";

/** Нарушение правил заявки — 422 invalid_request с текстом для гостя */
const guard = async <T>(run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    if (error instanceof InvalidRequest) throw new ApiError(422, "invalid_request", error.message);
    throw error;
  }
};

@Controller()
export class RequestsController {
  constructor(
    private readonly requestHall: RequestHall,
    private readonly requestGifts: RequestGifts,
    private readonly getCrates: GetMonthlyCrates,
    private readonly subscribeMonthly: SubscribeMonthly,
    private readonly issueCertificate: IssueCertificate
  ) {}

  /** POST /api/requests/hall — operationId createHallRequest */
  @Post("requests/hall")
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_request", INVALID)
  @ContractResponse(zCreateHallRequestResponse)
  async hall(@Body({ schema: zCreateHallRequestBody }) body: z.output<typeof zCreateHallRequestBody>): Promise<Schemas["ServiceRequest"]> {
    const { id, number } = await guard(() => this.requestHall.execute(body));
    return { id, number: requestNumber("R", number) };
  }

  /** POST /api/requests/gift — operationId createGiftRequest */
  @Post("requests/gift")
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_request", INVALID)
  @ContractResponse(zCreateGiftRequestResponse)
  async gift(@Body({ schema: zCreateGiftRequestBody }) body: z.output<typeof zCreateGiftRequestBody>): Promise<Schemas["ServiceRequest"]> {
    const { id, number } = await guard(() => this.requestGifts.execute(body));
    return { id, number: requestNumber("R", number) };
  }

  /** GET /api/monthly — operationId getMonthlyCrates: ящик меняется раз в месяц */
  @Get("monthly")
  @Header("Cache-Control", "public, max-age=3600")
  @ContractResponse(zGetMonthlyCratesResponse)
  async monthly(): Promise<Schemas["MonthlyCrates"]> {
    const crates = await this.getCrates.execute();
    if (!crates) throw new ApiError(404, "not_found", "Ящиков пока нет");
    return crates;
  }

  /** POST /api/monthly/subscriptions — operationId createMonthlySubscription */
  @Post("monthly/subscriptions")
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_request", INVALID)
  @ContractResponse(zCreateMonthlySubscriptionResponse)
  async subscribe(
    @Body({ schema: zCreateMonthlySubscriptionBody }) body: z.output<typeof zCreateMonthlySubscriptionBody>,
    @CurrentUser() userId: string | null
  ): Promise<Schemas["ServiceRequest"]> {
    // Вошедший гость (необязательная сессия на шлюзе) — подписка появится в кабинете
    const { id, number } = await guard(() => this.subscribeMonthly.execute({ ...body, userId }));
    return { id, number: requestNumber("M", number) };
  }

  /** POST /api/certificates — operationId createCertificate */
  @Post("certificates")
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_request", INVALID)
  @ContractResponse(zCreateCertificateResponse)
  async certificate(@Body({ schema: zCreateCertificateBody }) body: z.output<typeof zCreateCertificateBody>): Promise<Schemas["Certificate"]> {
    const certificate = await guard(() => this.issueCertificate.execute(body));
    return {
      id: certificate.id,
      serial: certificateSerial(certificate.year, certificate.number),
      nominal: certificate.nominal,
      validUntil: certificate.validUntil,
      status: certificate.status,
    };
  }
}
