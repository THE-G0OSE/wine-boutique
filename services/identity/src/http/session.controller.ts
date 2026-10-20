import { Controller, Get, Header, Req, Res } from "@nestjs/common";
import { ContractResponse } from "@wine/service-kit";
import { zGetSessionResponse } from "@wine/contracts/openapi/zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ResolveSession, type Session } from "../application/sessions.js";
import { sessionTokenOf, setSessionCookie } from "./session-cookie.js";

@Controller("auth")
export class SessionController {
  constructor(private readonly resolveSession: ResolveSession) {}

  /** GET /api/auth/session — operationId getSession: кто вошёл по cookie сессии, гость — user: null */
  @Get("session")
  @Header("Cache-Control", "no-store")
  @ContractResponse(zGetSessionResponse)
  async session(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply): Promise<Session> {
    const token = sessionTokenOf(request);
    const resolved = await this.resolveSession.execute(token);
    if (resolved?.renewedUntil && token) setSessionCookie(reply, token, resolved.renewedUntil);
    return { user: resolved?.user ?? null };
  }
}
