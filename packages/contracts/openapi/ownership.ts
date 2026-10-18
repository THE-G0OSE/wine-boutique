import type { operations } from "./generated/schema.js";

/** Сервисы бэкенда — владельцы частей публичного API */
export type ServiceName = "catalog" | "news" | "reviews" | "newsletter" | "identity";

/**
 * Какой сервис реализует каждую операцию контракта. Тип требует владельца у каждого `operationId`:
 * новая операция в openapi.yaml без строки здесь — ошибка компиляции. Traefik маршрутизирует по этой же раскладке.
 */
export const OPERATION_OWNERS = {
  getWines: "catalog",
  getGrapes: "catalog",
  getSession: "identity",
  getLatestNewsIssue: "news",
  getNewsArticle: "news",
  getNewsArchive: "news",
  subscribeNewsletter: "newsletter",
  getReviews: "reviews",
  sendReview: "reviews",
} as const satisfies Record<keyof operations, ServiceName>;

export type OperationId = keyof typeof OPERATION_OWNERS;

/** Операции, которые реализует сервис */
export const operationsOf = (service: ServiceName): OperationId[] =>
  (Object.keys(OPERATION_OWNERS) as OperationId[]).filter((id) => OPERATION_OWNERS[id] === service);
