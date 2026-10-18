import type { IncomingMessage } from "node:http";
import helmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";
import type { DynamicModule, INestApplication, Type } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "nestjs-pino";
import type { BaseConfig } from "./config/config.js";
import { ensureRequestId, REQUEST_ID_HEADER } from "./http/request-id.js";

/** Публичные пути — с префиксом /api, как `servers.url` в контракте; Traefik маршрутизирует без переписывания */
export const API_PREFIX = "api";

/**
 * Адаптер Fastify с ограничениями из правил: тело запроса — до 64 КБ, адрес клиента — из заголовков шлюза.
 * Request id — из заголовка шлюза или новый UUID; его же берут логи (pino-http использует id запроса Fastify).
 */
export const createFastifyAdapter = (): FastifyAdapter =>
  new FastifyAdapter({ bodyLimit: 64 * 1024, trustProxy: true, genReqId: (req: IncomingMessage) => ensureRequestId(req.headers) });

/** Настройки приложения, общие для запуска и тестов */
export const configureApp = async (app: INestApplication & NestFastifyApplication): Promise<void> => {
  app.setGlobalPrefix(API_PREFIX, { exclude: ["health/live", "health/ready"] });
  await app.register(helmet);
  // Request id — в каждом ответе, чтобы по нему найти запрос в логах
  const fastify: FastifyInstance = app.getHttpAdapter().getInstance();
  fastify.addHook("onSend", async (request, reply) => {
    reply.header(REQUEST_ID_HEADER, request.id);
  });
  app.enableShutdownHooks();
};

/** Запуск сервиса: `await startService(AppModule.forRoot(config), config)` */
export const startService = async (module: Type | DynamicModule, config: BaseConfig): Promise<NestFastifyApplication> => {
  const app = await NestFactory.create<NestFastifyApplication>(module, createFastifyAdapter(), { bufferLogs: true });
  app.useLogger(app.get(Logger));
  await configureApp(app);
  await app.listen({ host: config.HTTP_HOST, port: config.HTTP_PORT });
  return app;
};
