import { createOpenApiHttp } from "openapi-msw";
import { env } from "@/shared/config/env";
import type { paths } from "./schema";

/**
 * MSW `http`, типизированный контрактом api/openapi.yaml: пути, параметры и тела ответов
 * проверяются TypeScript. Импортируется только из файлов `mocks.ts` — в основной бандл не попадает.
 */
export const mockHttp = createOpenApiHttp<paths>({ baseUrl: env.apiUrl });
