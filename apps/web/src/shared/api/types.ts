import type { components, operations } from "@wine/contracts/openapi";

/** Схемы из api/openapi.yaml: `ApiSchemas["WineSummary"]` */
export type ApiSchemas = components["schemas"];

/** Query-параметры операции: `ApiQuery<"getWines">` */
export type ApiQuery<K extends keyof operations> = NonNullable<operations[K]["parameters"]["query"]>;

/** Тело запроса операции: `ApiBody<"subscribeNewsletter">` */
export type ApiBody<K extends keyof operations> = operations[K] extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

/** Ошибка, которую RTK Query отдаёт для ответа сервера с телом Error */
export interface ApiError {
  status: number;
  data: ApiSchemas["Error"];
}

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  typeof (error as { status: unknown }).status === "number" &&
  "data" in error &&
  typeof (error as { data: unknown }).data === "object";
