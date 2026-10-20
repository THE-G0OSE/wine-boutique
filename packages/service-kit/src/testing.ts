import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import type { DynamicModule, Type } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { operationsOf, type ServiceName } from "@wine/contracts/openapi/ownership";
import { parse } from "yaml";
import { API_PREFIX, configureApp, createFastifyAdapter } from "./bootstrap.js";
import { connectGrpc, type GrpcServerOptions } from "./grpc.js";

/**
 * Приложение сервиса для тестов: те же адаптер, префикс и глобальные пайпы, без сетевого порта.
 * Запросы — через `app.inject({ method, url })`.
 */
export const createTestApp = async (
  module: Type | DynamicModule,
  options: { grpc?: GrpcServerOptions } = {}
): Promise<NestFastifyApplication> => {
  const moduleRef = await Test.createTestingModule({ imports: [module] }).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(createFastifyAdapter(), { logger: false });
  await configureApp(app);
  if (options.grpc) {
    connectGrpc(app, options.grpc);
    await app.startAllMicroservices();
  }
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
};

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

/**
 * Операции контракта, принадлежащие сервису, для которых в приложении нет маршрута.
 * Тест покрытия контракта: `expect(await missingOperations(app, "identity")).toEqual([])`.
 */
export const missingOperations = async (app: NestFastifyApplication, service: ServiceName): Promise<string[]> => {
  const spec = parse(await readFile(fileURLToPath(import.meta.resolve("@wine/contracts/openapi.yaml")), "utf8")) as {
    paths: Record<string, Partial<Record<(typeof HTTP_METHODS)[number], { operationId: string }>>>;
  };
  const owned = new Set<string>(operationsOf(service));
  const fastify = app.getHttpAdapter().getInstance();
  const missing: string[] = [];
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = item[method];
      if (!operation || !owned.has(operation.operationId)) continue;
      // /news/articles/{slug} → /api/news/articles/:slug
      const url = `/${API_PREFIX}${path.replace(/\{(\w+)\}/g, ":$1")}`;
      if (!fastify.hasRoute({ method: method.toUpperCase() as "GET", url })) missing.push(`${operation.operationId} ${method.toUpperCase()} ${url}`);
    }
  }
  return missing;
};

const execFileAsync = promisify(execFile);

/**
 * Миграции сервиса на базе из Testcontainers (`prisma migrate deploy` в каталоге сервиса).
 * Docker Desktop на Windows открывает проброшенный порт не сразу после старта контейнера — первые попытки
 * могут получить P1001 (база недоступна), поэтому несколько повторов с паузой.
 */
export const migrateDatabase = async (databaseUrl: string, { attempts = 10, delayMs = 2000 } = {}): Promise<void> => {
  for (let attempt = 1; ; attempt++) {
    try {
      await execFileAsync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
        env: { ...process.env, DATABASE_URL: databaseUrl },
        shell: process.platform === "win32",
      });
      return;
    } catch (error) {
      const output = `${(error as { stdout?: string }).stdout ?? ""}${(error as { stderr?: string }).stderr ?? ""}`;
      if (attempt >= attempts || !output.includes("P1001")) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};
