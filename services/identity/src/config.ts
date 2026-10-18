import { baseConfigSchema } from "@wine/service-kit";
import type { z } from "zod";

/** Окружение identity. Секреты сессий и SMS появятся с фазой входа по телефону */
export const configSchema = baseConfigSchema.extend({});

export type IdentityConfig = z.output<typeof configSchema>;
