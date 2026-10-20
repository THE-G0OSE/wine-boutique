import { All, Controller, Header, HttpCode, Req, Res } from "@nestjs/common";
import { ApiError, USER_ID_HEADER } from "@wine/service-kit";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ResolveSession } from "../application/sessions.js";
import { sessionTokenOf, setSessionCookie } from "./session-cookie.js";

/**
 * Проверка сессии для шлюза (Traefik forwardAuth, middleware `require-session`) — не публичный API:
 * путь вне /api, наружу Traefik его не маршрутизирует.
 * Вошёл — 200 и X-User-Id (Traefik передаст его сервису); гость — 401 в формате контракта, его Traefik отдаст клиенту.
 * Продлённая сессия — Set-Cookie с новым сроком (Traefik добавит её в ответ: addAuthCookiesToResponse).
 */
@Controller("internal")
export class ForwardAuthController {
  constructor(private readonly resolveSession: ResolveSession) {}

  // Любой метод: метод исходного запроса Traefik передаёт в X-Forwarded-Method, но сам запрос может прийти не GET
  @All("forward-auth")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  async check(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    const token = sessionTokenOf(request);
    const resolved = await this.resolveSession.execute(token);
    if (!resolved) throw new ApiError(401, "unauthorized", "Войдите, чтобы продолжить");
    if (resolved.renewedUntil && token) setSessionCookie(reply, token, resolved.renewedUntil);
    reply.header(USER_ID_HEADER, resolved.user.id);
  }

  /**
   * Необязательная сессия — для публичных форм (бронь, запись, подписка): вошёл — X-User-Id, и запись попадёт в кабинет;
   * гость — тоже 200, но без заголовка, форма работает как раньше
   */
  @All("forward-auth-optional")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  async optional(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    const token = sessionTokenOf(request);
    const resolved = await this.resolveSession.execute(token);
    if (!resolved) return;
    if (resolved.renewedUntil && token) setSessionCookie(reply, token, resolved.renewedUntil);
    reply.header(USER_ID_HEADER, resolved.user.id);
  }
}
