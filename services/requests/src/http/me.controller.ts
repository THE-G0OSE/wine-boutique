import { Body, Controller, Get, Header, HttpCode, Patch, Post } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import {
  zAddMyCertificateBody,
  zAddMyCertificateResponse,
  zGetMyCertificatesResponse,
  zGetMyMonthlyResponse,
  zUpdateMyMonthlyBody,
  zUpdateMyMonthlyResponse,
} from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, CurrentUser, ValidationError } from "@wine/service-kit";
import type { z } from "zod";
import type { OwnedCertificate, StoredSubscription } from "../application/ports.js";
import { CertificateNotFound, CertificateUnavailable, MyCertificates, MyMonthly } from "../application/requests.js";
import { certificateSerial, InvalidRequest, requestNumber } from "../domain/requests.js";

type Schemas = components["schemas"];

const requireUser = (userId: string | null): string => {
  if (!userId) throw new ApiError(401, "unauthorized", "Войдите, чтобы продолжить");
  return userId;
};

const toSubscription = (subscription: StoredSubscription | null): Schemas["MyMonthlyResponse"] => ({
  subscription:
    subscription && subscription.status !== "cancelled"
      ? { number: requestNumber("M", subscription.number), plan: subscription.plan, boutiqueId: subscription.boutiqueId, status: subscription.status, skipMonth: subscription.skipMonth }
      : null,
});

const toCertificate = (certificate: OwnedCertificate): Schemas["MyCertificate"] => ({
  serial: certificateSerial(certificate.year, certificate.number),
  nominal: certificate.nominal,
  balance: certificate.balance,
  validUntil: certificate.validUntil,
  from: certificate.senderName,
  status: certificate.status,
});

/** Кабинет: подписка на набор месяца и сертификаты. Шлюз пускает только вошедших и передаёт X-User-Id */
@Controller("me")
export class MeController {
  constructor(
    private readonly monthly: MyMonthly,
    private readonly certificates: MyCertificates
  ) {}

  /** GET /api/me/monthly — operationId getMyMonthly */
  @Get("monthly")
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetMyMonthlyResponse)
  async getMonthly(@CurrentUser() userId: string | null): Promise<Schemas["MyMonthlyResponse"]> {
    return toSubscription(await this.monthly.get(requireUser(userId)));
  }

  /** PATCH /api/me/monthly — operationId updateMyMonthly */
  @Patch("monthly")
  @Header("Cache-Control", "private, no-store")
  @ValidationError("invalid_request", "Проверьте изменения подписки")
  @ContractResponse(zUpdateMyMonthlyResponse)
  async updateMonthly(
    @CurrentUser() userId: string | null,
    @Body({ schema: zUpdateMyMonthlyBody }) body: z.output<typeof zUpdateMyMonthlyBody>
  ): Promise<Schemas["MyMonthlyResponse"]> {
    try {
      return toSubscription(await this.monthly.update(requireUser(userId), body));
    } catch (error) {
      if (error instanceof InvalidRequest) throw new ApiError(404, "not_found", error.message);
      throw error;
    }
  }

  /** GET /api/me/certificates — operationId getMyCertificates */
  @Get("certificates")
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetMyCertificatesResponse)
  async listCertificates(@CurrentUser() userId: string | null): Promise<Schemas["MyCertificates"]> {
    return (await this.certificates.list(requireUser(userId))).map(toCertificate);
  }

  /** POST /api/me/certificates — operationId addMyCertificate */
  @Post("certificates")
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @ValidationError("invalid_request", "Номер сертификата — вида WB-2026-000123")
  @ContractResponse(zAddMyCertificateResponse)
  async addCertificate(
    @CurrentUser() userId: string | null,
    @Body({ schema: zAddMyCertificateBody }) { serial }: z.output<typeof zAddMyCertificateBody>
  ): Promise<Schemas["MyCertificate"]> {
    try {
      return toCertificate(await this.certificates.claim(requireUser(userId), serial));
    } catch (error) {
      if (error instanceof CertificateNotFound) throw new ApiError(404, "not_found", error.message);
      if (error instanceof CertificateUnavailable) throw new ApiError(409, "certificate_unavailable", error.message);
      throw error;
    }
  }
}
