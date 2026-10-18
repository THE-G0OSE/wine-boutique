import { Controller, Get, Header } from "@nestjs/common";
import { ContractResponse } from "@wine/service-kit";
import { zGetSessionResponse } from "@wine/contracts/openapi/zod";
import { GetCurrentSession, type Session } from "../application/get-current-session.js";

@Controller("auth")
export class SessionController {
  constructor(private readonly getCurrentSession: GetCurrentSession) {}

  /** GET /api/auth/session — operationId getSession */
  @Get("session")
  @Header("Cache-Control", "no-store")
  @ContractResponse(zGetSessionResponse)
  session(): Promise<Session> {
    return this.getCurrentSession.execute();
  }
}
