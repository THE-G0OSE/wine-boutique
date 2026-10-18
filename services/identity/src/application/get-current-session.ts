import { Injectable } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";

export type Session = components["schemas"]["Session"];

/**
 * Сессия посетителя. Входа ещё нет (фаза 8 фронта), поэтому посетитель всегда гость.
 * Потом сценарий получит токен из cookie и найдёт сессию в базе.
 */
@Injectable()
export class GetCurrentSession {
  async execute(): Promise<Session> {
    return { user: null };
  }
}
