import { Injectable } from "@nestjs/common";
import { SessionRepository } from "../../application/ports.js";
import type { ActiveSession } from "../../domain/session.js";
import { IdentityPrisma } from "./identity-prisma.js";

@Injectable()
export class PrismaSessionRepository extends SessionRepository {
  constructor(private readonly prisma: IdentityPrisma) {
    super();
  }

  createUser(name: string): Promise<{ id: string }> {
    return this.prisma.user.create({ data: { name }, select: { id: true } });
  }

  async create(userId: string, tokenHash: Buffer, expiresAt: Date, now: Date): Promise<void> {
    await this.prisma.session.create({ data: { userId, tokenHash: new Uint8Array(tokenHash), expiresAt, lastSeenAt: now } });
  }

  async findActive(tokenHash: Buffer, now: Date): Promise<ActiveSession | null> {
    const session = await this.prisma.session.findFirst({
      where: { tokenHash: new Uint8Array(tokenHash), revokedAt: null, expiresAt: { gt: now } },
      select: { id: true, userId: true, expiresAt: true, lastSeenAt: true, user: { select: { name: true } } },
    });
    return session
      ? { sessionId: session.id, userId: session.userId, userName: session.user.name, expiresAt: session.expiresAt, lastSeenAt: session.lastSeenAt }
      : null;
  }

  async touch(sessionId: string, lastSeenAt: Date, expiresAt: Date): Promise<void> {
    await this.prisma.session.update({ where: { id: sessionId }, data: { lastSeenAt, expiresAt } });
  }

  async revoke(sessionId: string, now: Date): Promise<void> {
    await this.prisma.session.update({ where: { id: sessionId }, data: { revokedAt: now } });
  }
}
