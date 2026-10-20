import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

/** Заголовок с id вошедшего пользователя: ставит Traefik по ответу identity (forward-auth), входящий снаружи — вырезает */
export const USER_ID_HEADER = "x-user-id";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * id пользователя из заголовка шлюза, гость — null: `handler(@CurrentUser() userId: string | null)`.
 * Заголовку можно верить только за шлюзом: сеть сервисов снаружи закрыта.
 */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): string | null => {
  const value = context.switchToHttp().getRequest<FastifyRequest>().headers[USER_ID_HEADER];
  return typeof value === "string" && UUID.test(value) ? value.toLowerCase() : null;
});
