import { baseConfigSchema } from "@wine/service-kit";
import { z } from "zod";

export const configSchema = baseConfigSchema.extend({
  /** Роль и база сервиса: postgresql://catalog:…@host:5432/catalog */
  DATABASE_URL: z.string().startsWith("postgres"),
  /** Соединений в пуле — сумма по сервисам должна влезать в лимит Postgres */
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(5),
  /** Внутренний gRPC-API (wine.catalog.v1.CatalogService) — только в сети сервисов */
  GRPC_URL: z.string().default("0.0.0.0:50051"),
});

export type CatalogConfig = z.output<typeof configSchema>;
