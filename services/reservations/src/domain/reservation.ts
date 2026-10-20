/** Версия текста согласия на обработку ПДн и правил брони — сохраняется с бронью (152-ФЗ) */
export const CONSENT_VERSION = "2026-10-20";

export type ReservationStatus = "active" | "completed" | "cancelled" | "expired";

export interface ReservationItem {
  wineId: string;
  slug: string;
  name: string;
  imageUrl: string;
  qty: number;
  /** Копейки на момент брони; null — цена не назначена */
  priceKopecks: number | null;
}

export interface Reservation {
  id: string;
  number: number;
  status: ReservationStatus;
  boutiqueId: string;
  pickupAt: Date;
  holdUntil: Date;
  customerName: string;
  createdAt: Date;
  extended: boolean;
  items: ReservationItem[];
}

/** Сумма в рублях; null — пока хоть у одного вина нет цены */
export const totalRubles = (items: ReservationItem[]): number | null =>
  items.every((item) => item.priceKopecks !== null)
    ? Math.round(items.reduce((sum, item) => sum + item.priceKopecks! * item.qty, 0) / 100)
    : null;

/** Ошибки правил брони — сценарий переводит их в ответ API */
export type ReservationErrorCode =
  | "invalid_reservation"
  | "slot_unavailable"
  | "unknown_wines"
  | "catalog_unavailable"
  | "not_found"
  | "cannot_extend"
  | "cannot_cancel";

/** Продление брони из кабинета — на 3 дня и один раз */
export const EXTENSION_DAYS = 3;

/** Бронь ждёт гостя: активна и срок не вышел (истечение не ждёт фоновой задачи — считается при чтении) */
export const isWaiting = (reservation: Reservation, now: Date) => reservation.status === "active" && reservation.holdUntil > now;

export class ReservationError extends Error {
  constructor(
    readonly code: ReservationErrorCode,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}
