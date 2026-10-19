import { baseConfigSchema } from "@wine/service-kit";
import { z } from "zod";

export const configSchema = baseConfigSchema.extend({
  /** Роль и база сервиса: postgresql://news:…@host:5432/news */
  DATABASE_URL: z.string().startsWith("postgres"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(5),
  /** Внутренний API catalog — вино для стикера «Забронировать» */
  CATALOG_GRPC_URL: z.string().default("catalog:50051"),
  /** Дедлайн вызова catalog, мс: дольше ждать нельзя — статья откроется без вина */
  CATALOG_TIMEOUT_MS: z.coerce.number().int().min(50).default(1000),
});

export type NewsConfig = z.output<typeof configSchema>;
