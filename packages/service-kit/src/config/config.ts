import { z } from "zod";

/** Переменные окружения, общие для всех сервисов. Сервис расширяет схему своими через `.extend()` */
export const baseConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SERVICE_NAME: z.string().min(1),
  HTTP_HOST: z.string().default("0.0.0.0"),
  HTTP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  /**
   * Сайты, с которых браузер может слать изменяющие запросы (защита от CSRF по Origin), через запятую:
   * "https://example.ru,http://localhost:5173". Пусто — изменяющие запросы из браузера с любого сайта отклоняются
   */
  ALLOWED_ORIGINS: z
    .string()
    .default("")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
});

export type BaseConfig = z.output<typeof baseConfigSchema>;

/**
 * Читает и проверяет окружение при старте. Нет обязательной переменной или значение неверно —
 * сервис не запускается и пишет, что именно не так.
 */
export const loadConfig = <S extends z.ZodType<BaseConfig>>(schema: S, env: NodeJS.ProcessEnv = process.env): z.output<S> => {
  const result = schema.safeParse(env);
  if (!result.success) {
    throw new Error(`Конфигурация сервиса неверна:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
};

/** DI-токен конфигурации сервиса: `@Inject(SERVICE_CONFIG) config: MyConfig` */
export const SERVICE_CONFIG = Symbol("SERVICE_CONFIG");
