import { baseConfigSchema } from "@wine/service-kit";
import { z } from "zod";

export const configSchema = baseConfigSchema.extend({
  /** Роль и база сервиса: postgresql://loyalty:…@host:5432/loyalty */
  DATABASE_URL: z.string().startsWith("postgres"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(5),
  /** Внутренний API catalog — карточки избранных вин */
  CATALOG_GRPC_URL: z.string().default("catalog:50051"),
  /** Дедлайн вызова catalog, мс: не ответил — избранное без карточек (503) */
  CATALOG_TIMEOUT_MS: z.coerce.number().int().min(50).default(1000),
});

export type LoyaltyConfig = z.output<typeof configSchema>;
