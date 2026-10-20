/**
 * Правила афиши и записи — те же, что в эталоне @wine/demo-data (тесты сверяют):
 * - время — по часам погреба, месяц афиши — с полуночи первого числа до полуночи следующего месяца;
 * - началась — past, мест нет — full, иначе open;
 * - в записи 1–6 гостей и не больше свободных мест; в лист ожидания — только когда мест нет.
 */

export const CELLAR_TIMEZONE = "Europe/Moscow";
export const MAX_GUESTS = 6;
/** Версия текста согласия на обработку ПДн — сохраняется с записью (152-ФЗ) */
export const CONSENT_VERSION = "2026-10-20";

export type TastingKind = "vertical" | "blind" | "dinner" | "masterclass";
export type TastingStatus = "open" | "full" | "past";

export interface Tasting {
  id: string;
  kind: TastingKind;
  title: string;
  description: string;
  startsAt: Date;
  durationMinutes: number;
  wines: number;
  capacity: number;
  seatsTaken: number;
  priceKopecks: number | null;
  host: string;
}

export const seatsLeft = (tasting: Tasting) => Math.max(0, tasting.capacity - tasting.seatsTaken);

export const statusOf = (tasting: Tasting, now: Date): TastingStatus =>
  tasting.startsAt.getTime() <= now.getTime() ? "past" : seatsLeft(tasting) === 0 ? "full" : "open";

/** «2026-10» → «2026-11» */
export const nextMonth = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

export type TastingErrorCode = "invalid_booking" | "not_found" | "tasting_closed" | "not_enough_seats" | "seats_available";

/** Ошибки правил записи — контроллер переводит их в ответ API */
export class TastingError extends Error {
  constructor(
    readonly code: TastingErrorCode,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}
