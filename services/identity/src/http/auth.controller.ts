import { Body, Controller, Header, HttpCode, Post, Req, Res } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import {
  zRegisterGuestBody,
  zRegisterGuestResponse,
  zRequestPhoneCodeBody,
  zRequestPhoneCodeResponse,
  zVerifyPhoneCodeBody,
  zVerifyPhoneCodeResponse,
} from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, RateLimit, ValidationError } from "@wine/service-kit";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import { RegisterGuest, RequestPhoneCode, VerifyPhoneCode } from "../application/phone-auth.js";
import { IssueSession } from "../application/sessions.js";
import { AuthError } from "../domain/phone-auth.js";
import { initialsOf } from "../domain/session.js";
import { clearSessionCookie, sessionTokenOf, setSessionCookie } from "./session-cookie.js";

type Schemas = components["schemas"];

const STATUS: Record<string, number> = { too_many_requests: 429, code_expired: 410, registration_expired: 410 };

const guard = async <T>(run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    if (error instanceof AuthError) throw new ApiError(STATUS[error.code] ?? 422, error.code, error.message, error.details);
    throw error;
  }
};

const toSessionUser = (user: { id: string; name: string; cardNumber: string | null }): Schemas["SessionUser"] => ({
  id: user.id,
  name: user.name,
  initials: initialsOf(user.name),
  cardNumber: user.cardNumber,
});

/** Вход по телефону: код в SMS → вход или карта гостя; выход */
@Controller("auth")
export class AuthController {
  constructor(
    private readonly requestCode: RequestPhoneCode,
    private readonly verifyCode: VerifyPhoneCode,
    private readonly registerGuest: RegisterGuest,
    private readonly sessions: IssueSession
  ) {}

  /** POST /api/auth/phone/code — operationId requestPhoneCode */
  @Post("phone/code")
  @HttpCode(202)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_phone", "Проверьте номер телефона")
  @ContractResponse(zRequestPhoneCodeResponse)
  code(@Body({ schema: zRequestPhoneCodeBody }) { phone }: z.output<typeof zRequestPhoneCodeBody>): Promise<Schemas["PhoneCodeSent"]> {
    return guard(() => this.requestCode.execute(phone));
  }

  /** POST /api/auth/phone/verify — operationId verifyPhoneCode */
  @Post("phone/verify")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  @RateLimit(10, 60_000)
  @ValidationError("invalid_code", "Код — четыре цифры")
  @ContractResponse(zVerifyPhoneCodeResponse)
  async verify(
    @Body({ schema: zVerifyPhoneCodeBody }) { phone, code }: z.output<typeof zVerifyPhoneCodeBody>,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<Schemas["PhoneVerification"]> {
    const result = await guard(() => this.verifyCode.execute(phone, code, new Date(), request.headers["user-agent"] ?? null));
    if (result.status === "needs_registration") return result;
    setSessionCookie(reply, result.session.token, result.session.expiresAt);
    return { status: "signed_in", user: toSessionUser(result.user) };
  }

  /** POST /api/auth/register — operationId registerGuest */
  @Post("register")
  @HttpCode(201)
  @Header("Cache-Control", "no-store")
  @RateLimit(5, 60_000)
  @ValidationError("invalid_registration", "Проверьте имя, дату рождения и отметьте согласие")
  @ContractResponse(zRegisterGuestResponse)
  async register(
    @Body({ schema: zRegisterGuestBody }) body: z.output<typeof zRegisterGuestBody>,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<Schemas["Session"]> {
    const { user, session } = await guard(() => this.registerGuest.execute(body, new Date(), request.headers["user-agent"] ?? null));
    setSessionCookie(reply, session.token, session.expiresAt);
    return { user: toSessionUser(user) };
  }

  /** POST /api/auth/logout — operationId signOut: сессия отзывается, cookie стирается (и для гостя тоже) */
  @Post("logout")
  @HttpCode(204)
  @Header("Cache-Control", "no-store")
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    const token = sessionTokenOf(request);
    if (token) await this.sessions.revoke(token);
    clearSessionCookie(reply);
  }
}
