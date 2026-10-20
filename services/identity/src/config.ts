import { baseConfigSchema } from "@wine/service-kit";
import { z } from "zod";

/** Окружение identity. Секреты SMS появятся с фазой входа по телефону */
export const configSchema = baseConfigSchema.extend({
  /** Роль и база сервиса: postgresql://identity:…@host:5432/identity */
  DATABASE_URL: z.string().startsWith("postgres"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(3),
});

export type IdentityConfig = z.output<typeof configSchema>;
