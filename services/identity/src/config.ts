import { baseConfigSchema } from "@wine/service-kit";
import { z } from "zod";

/** Окружение identity. Секреты SMS появятся с сервисом notifications */
export const configSchema = baseConfigSchema.extend({
  /** Роль и база сервиса: postgresql://identity:…@host:5432/identity */
  DATABASE_URL: z.string().startsWith("postgres"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(3),
  /**
   * Демо без SMS-провайдера (портфолио): код входа возвращается в ответе на запрос кода и показывается на экране.
   * Код по-прежнему одноразовый, живёт 5 минут, с лимитами попыток и частоты — проверяется весь сценарий, кроме доставки
   */
  DEMO_CODES: z.stringbool().default(false),
});

export type IdentityConfig = z.output<typeof configSchema>;
