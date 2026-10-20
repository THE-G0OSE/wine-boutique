import type { operations } from "./generated/schema.js";

/** Сервисы бэкенда — владельцы частей публичного API */
export type ServiceName = "catalog" | "news" | "reviews" | "newsletter" | "identity" | "reservations" | "tastings" | "cellar" | "requests" | "loyalty";

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
  requestPhoneCode: "identity",
  verifyPhoneCode: "identity",
  registerGuest: "identity",
  signOut: "identity",
  getProfile: "identity",
  updateProfile: "identity",
  deleteProfile: "identity",
  signOutEverywhere: "identity",
  getMyReservations: "reservations",
  extendMyReservation: "reservations",
  cancelMyReservation: "reservations",
  getMyTastings: "tastings",
  getMyCell: "cellar",
  prepareMyCell: "cellar",
  getMyMonthly: "requests",
  updateMyMonthly: "requests",
  getMyCertificates: "requests",
  addMyCertificate: "requests",
  getMyLoyalty: "loyalty",
  getMyFavorites: "loyalty",
  addFavorite: "loyalty",
  removeFavorite: "loyalty",
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
  getCellarCells: "cellar",
  createCellarRequest: "cellar",
  createHallRequest: "requests",
  createGiftRequest: "requests",
  getMonthlyCrates: "requests",
  createMonthlySubscription: "requests",
  createCertificate: "requests",
} as const satisfies Record<keyof operations, ServiceName>;

export type OperationId = keyof typeof OPERATION_OWNERS;

/** Операции, которые реализует сервис */
export const operationsOf = (service: ServiceName): OperationId[] =>
  (Object.keys(OPERATION_OWNERS) as OperationId[]).filter((id) => OPERATION_OWNERS[id] === service);
