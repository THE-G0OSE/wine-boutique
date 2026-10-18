import { RequestMethod } from "@nestjs/common";
import type { Params } from "nestjs-pino";
import type { BaseConfig } from "../config/config.js";

/** Заголовки с секретами и ПДн в лог не попадают. Тела запросов pino-http не логирует вообще */
const REDACT = ["req.headers.cookie", "req.headers.authorization", 'res.headers["set-cookie"]'];

/**
 * JSON-логи pino: имя сервиса, request id (Fastify берёт его из `x-request-id` шлюза), trace id добавляет OpenTelemetry.
 * В разработке — читаемый вывод pino-pretty.
 */
export const loggerOptions = (config: BaseConfig): Params => ({
  pinoHttp: {
    level: config.LOG_LEVEL,
    base: { service: config.SERVICE_NAME },
    redact: { paths: REDACT, censor: "[скрыто]" },
    transport: config.NODE_ENV === "development" ? { target: "pino-pretty", options: { singleLine: true } } : undefined,
  },
  // Пробы здоровья дёргаются часто и неинтересны
  exclude: [
    { method: RequestMethod.GET, path: "health/live" },
    { method: RequestMethod.GET, path: "health/ready" },
  ],
});
