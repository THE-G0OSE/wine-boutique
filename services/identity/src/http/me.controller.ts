import { Body, Controller, Delete, Get, Header, HttpCode, Patch, Post, Req, Res } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetProfileResponse, zUpdateProfileBody, zUpdateProfileResponse } from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, CurrentUser, ValidationError } from "@wine/service-kit";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import { CloseAccount, GetProfile, UpdateProfile } from "../application/profile.js";
import type { Profile } from "../domain/profile.js";
import { hashSessionToken, isWellFormedToken } from "../domain/session.js";
import { clearSessionCookie, sessionTokenOf } from "./session-cookie.js";

type Schemas = components["schemas"];

/** Без заголовка шлюза сюда не попасть (require-session); на всякий случай — 401 в формате контракта */
const requireUser = (userId: string | null): string => {
  if (!userId) throw new ApiError(401, "unauthorized", "Войдите, чтобы продолжить");
  return userId;
};

const toContract = (profile: Profile): Schemas["Profile"] => ({
  ...profile,
  sessions: profile.sessions.map((session) => ({ ...session, lastSeenAt: session.lastSeenAt.toISOString() })),
});

/** Кабинет: профиль, настройки, выход отовсюду и удаление. Пользователь — из X-User-Id шлюза */
@Controller("me")
export class MeController {
  constructor(
    private readonly getProfile: GetProfile,
    private readonly updateProfile: UpdateProfile,
    private readonly closeAccount: CloseAccount
  ) {}

  private async load(userId: string, request: FastifyRequest): Promise<Schemas["Profile"]> {
    const token = sessionTokenOf(request);
    const profile = await this.getProfile.execute(userId, token && isWellFormedToken(token) ? hashSessionToken(token) : null);
    if (!profile) throw new ApiError(401, "unauthorized", "Войдите, чтобы продолжить");
    return toContract(profile);
  }

  /** GET /api/me — operationId getProfile */
  @Get()
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetProfileResponse)
  profile(@CurrentUser() userId: string | null, @Req() request: FastifyRequest): Promise<Schemas["Profile"]> {
    return this.load(requireUser(userId), request);
  }

  /** PATCH /api/me — operationId updateProfile */
  @Patch()
  @Header("Cache-Control", "private, no-store")
  @ValidationError("invalid_profile", "Проверьте имя и почту")
  @ContractResponse(zUpdateProfileResponse)
  async update(
    @CurrentUser() userId: string | null,
    @Body({ schema: zUpdateProfileBody }) body: z.output<typeof zUpdateProfileBody>,
    @Req() request: FastifyRequest
  ): Promise<Schemas["Profile"]> {
    const id = requireUser(userId);
    if (body.name !== undefined && !body.name.trim()) throw new ApiError(422, "invalid_profile", "Имя не может быть пустым");
    await this.updateProfile.execute(id, body);
    return this.load(id, request);
  }

  /** DELETE /api/me — operationId deleteProfile: пользователь и сессии удаляются, cookie стирается */
  @Delete()
  @HttpCode(204)
  async remove(@CurrentUser() userId: string | null, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    await this.closeAccount.delete(requireUser(userId));
    clearSessionCookie(reply);
  }

  /** POST /api/me/sign-out-everywhere — operationId signOutEverywhere */
  @Post("sign-out-everywhere")
  @HttpCode(204)
  async signOutEverywhere(@CurrentUser() userId: string | null, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    await this.closeAccount.signOutEverywhere(requireUser(userId));
    clearSessionCookie(reply);
  }
}
