import { createOpenApiHttp } from "openapi-msw";
import { asset } from "@/shared/lib/asset";
import { env } from "@/shared/config/env";
import type { paths } from "@wine/contracts/openapi";

/**
 * MSW `http`, типизированный контрактом api/openapi.yaml: пути, параметры и тела ответов
 * проверяются TypeScript. Импортируется только из файлов `mocks.ts` — в основной бандл не попадает.
 */
export const mockHttp = createOpenApiHttp<paths>({ baseUrl: env.apiUrl });

/**
 * Картинки в демо-данных — пути от корня сайта (`/images/…`), как их отдал бы API.
 * При сборке с base (GitHub Pages: `/wine-boutique/`) мок дописывает его, чтобы картинки нашлись.
 * Настоящий бэкенд будет отдавать полные адреса — этот шаг только для моков.
 */
export const withAssetBase = <T>(data: T): T =>
  JSON.parse(JSON.stringify(data), (_key, value) =>
    typeof value === "string" && value.startsWith("/images/") ? asset(value) : value
  );
