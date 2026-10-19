import { applyDecorators, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

/**
 * Ограничение частоты для публичных форм: `@RateLimit(5, 60_000)` — не больше 5 запросов в минуту с одного адреса.
 * Адрес клиента — из X-Forwarded-For шлюза (trustProxy). Превышение — 429 в формате контракта.
 * Счётчики в памяти экземпляра: при нескольких экземплярах сервиса — общее хранилище (Valkey) или лимит на шлюзе.
 */
export const RateLimit = (limit: number, ttlMs: number) =>
  applyDecorators(UseGuards(ThrottlerGuard), Throttle({ default: { limit, ttl: ttlMs } }));
