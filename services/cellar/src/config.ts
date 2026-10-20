import { baseConfigSchema } from "@wine/service-kit";
import { z } from "zod";

export const configSchema = baseConfigSchema.extend({
  /** Роль и база сервиса: postgresql://cellar:…@host:5432/cellar */
  DATABASE_URL: z.string().startsWith("postgres"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(5),
});

export type CellarConfig = z.output<typeof configSchema>;
