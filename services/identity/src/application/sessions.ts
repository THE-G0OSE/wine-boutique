import { Injectable } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { hashSessionToken, initialsOf, isWellFormedToken, needsTouch, newSessionToken, SESSION_TTL_MS } from "../domain/session.js";
import { SessionRepository } from "./ports.js";

export type Session = components["schemas"]["Session"];
export type SessionUser = components["schemas"]["SessionUser"];

export interface ResolvedSession {
  user: SessionUser;
  /** Сессия продлена до этого срока — браузеру нужна cookie с новым сроком; null — продлевать не пора */
  renewedUntil: Date | null;
}

/** Кто вошёл: токен из cookie → пользователь. Нет токена, он чужой, истёк или отозван — гость (null) */
@Injectable()
export class ResolveSession {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(token: string | undefined, now = new Date()): Promise<ResolvedSession | null> {
    if (!token || !isWellFormedToken(token)) return null;
    const session = await this.sessions.findActive(hashSessionToken(token), now);
    if (!session) return null;
    let renewedUntil: Date | null = null;
    if (needsTouch(session, now)) {
      renewedUntil = new Date(now.getTime() + SESSION_TTL_MS);
      await this.sessions.touch(session.sessionId, now, renewedUntil);
    }
    return { user: { id: session.userId, name: session.userName, initials: initialsOf(session.userName), cardNumber: session.cardNumber }, renewedUntil };
  }
}

/**
 * Выдача и отзыв сессий. Пока входа нет — только для разработки (CLI `session:issue`).
 * С фазой 8 вход по телефону вызовет `issue` после проверки кода.
 */
@Injectable()
export class IssueSession {
  constructor(private readonly sessions: SessionRepository) {}

  async issue(userId: string, now = new Date(), userAgent: string | null = null): Promise<{ token: string; expiresAt: Date }> {
    const token = newSessionToken();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    await this.sessions.create(userId, hashSessionToken(token), expiresAt, now, userAgent);
    return { token, expiresAt };
  }

  async issueForNewUser(name: string, now = new Date()): Promise<{ userId: string; token: string; expiresAt: Date }> {
    const { id } = await this.sessions.createUser(name.trim());
    return { userId: id, ...(await this.issue(id, now)) };
  }

  /** Выход: сессия больше не действует. Неизвестный токен — false */
  async revoke(token: string, now = new Date()): Promise<boolean> {
    if (!isWellFormedToken(token)) return false;
    const session = await this.sessions.findActive(hashSessionToken(token), now);
    if (!session) return false;
    await this.sessions.revoke(session.sessionId, now);
    return true;
  }
}
