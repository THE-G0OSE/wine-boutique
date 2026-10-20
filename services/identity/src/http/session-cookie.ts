import { parseCookie, stringifySetCookie } from "cookie";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Cookie сессии. Префикс __Host-: браузер примет её только с Secure, Path=/ и без Domain,
 * поэтому её нельзя подложить с поддомена. На http://localhost браузеры Secure-cookie тоже принимают.
 */
export const SESSION_COOKIE = "__Host-session";

export const sessionTokenOf = (request: FastifyRequest): string | undefined => {
  const header = request.headers.cookie;
  return header ? parseCookie(header)[SESSION_COOKIE] : undefined;
};

/** Cookie с новым сроком после продления сессии */
export const setSessionCookie = (reply: FastifyReply, token: string, expires: Date): void => {
  reply.header(
    "set-cookie",
    stringifySetCookie({ name: SESSION_COOKIE, value: token, expires, path: "/", httpOnly: true, secure: true, sameSite: "lax" })
  );
};

/** Выход: та же cookie с датой в прошлом — браузер её удалит */
export const clearSessionCookie = (reply: FastifyReply): void => {
  reply.header(
    "set-cookie",
    stringifySetCookie({ name: SESSION_COOKIE, value: "", expires: new Date(0), path: "/", httpOnly: true, secure: true, sameSite: "lax" })
  );
};
