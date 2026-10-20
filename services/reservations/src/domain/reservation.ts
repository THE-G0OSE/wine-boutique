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
  items: ReservationItem[];
}

/** Сумма в рублях; null — пока хоть у одного вина нет цены */
export const totalRubles = (items: ReservationItem[]): number | null =>
  items.every((item) => item.priceKopecks !== null)
    ? Math.round(items.reduce((sum, item) => sum + item.priceKopecks! * item.qty, 0) / 100)
    : null;

/** Ошибки правил брони — сценарий переводит их в ответ API */
export type ReservationErrorCode = "invalid_reservation" | "slot_unavailable" | "unknown_wines" | "catalog_unavailable" | "not_found";

export class ReservationError extends Error {
  constructor(
    readonly code: ReservationErrorCode,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}
