import type { operations } from "./generated/schema.js";

/** Сервисы бэкенда — владельцы частей публичного API */
export type ServiceName = "catalog" | "news" | "reviews" | "newsletter" | "identity" | "reservations" | "tastings";

/**
 * Какой сервис реализует каждую операцию контракта. Тип требует владельца у каждого `operationId`:
 * новая операция в openapi.yaml без строки здесь — ошибка компиляции. Traefik маршрутизирует по этой же раскладке.
 */
export const OPERATION_OWNERS = {
  getShelves: "catalog",
  getWines: "catalog",
  getWineFacets: "catalog",
  getWine: "catalog",
  getSearchSuggestions: "catalog",
  getGrapes: "catalog",
  getSession: "identity",
  getLatestNewsIssue: "news",
  getNewsArticle: "news",
  getNewsArchive: "news",
  subscribeNewsletter: "newsletter",
  getReviews: "reviews",
  sendReview: "reviews",
  getBoutiques: "reservations",
  getBoutiqueSlots: "reservations",
  createReservation: "reservations",
  getReservation: "reservations",
  getTastings: "tastings",
  createTastingBooking: "tastings",
  joinTastingWaitlist: "tastings",
} as const satisfies Record<keyof operations, ServiceName>;

export type OperationId = keyof typeof OPERATION_OWNERS;

/** Операции, которые реализует сервис */
export const operationsOf = (service: ServiceName): OperationId[] =>
  (Object.keys(OPERATION_OWNERS) as OperationId[]).filter((id) => OPERATION_OWNERS[id] === service);
