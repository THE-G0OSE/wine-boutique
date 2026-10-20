import type { ActiveSession } from "../domain/session.js";

/** Хранилище пользователей и сессий — порт; реализация — Prisma в infrastructure */
export abstract class SessionRepository {
  abstract createUser(name: string): Promise<{ id: string }>;
  abstract create(userId: string, tokenHash: Buffer, expiresAt: Date, now: Date): Promise<void>;
  /** Не отозванная и не истёкшая сессия по хешу токена */
  abstract findActive(tokenHash: Buffer, now: Date): Promise<ActiveSession | null>;
  abstract touch(sessionId: string, lastSeenAt: Date, expiresAt: Date): Promise<void>;
  abstract revoke(sessionId: string, now: Date): Promise<void>;
}
