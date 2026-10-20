import { localDate } from "@wine/service-kit";

/**
 * Правила заявок — те же, что в эталоне @wine/demo-data (моки фронта, тесты сверяют):
 * - зал: гостей не больше вместимости рассадки, дата — с завтрашнего дня по Москве и не дальше года;
 * - сертификат действует год с даты оформления; электронному нужен e-mail получателя;
 * - набор месяца: текущий — свежий ящик не позже текущего месяца, в архиве — шесть предыдущих.
 */

export const TIMEZONE = "Europe/Moscow";
/** Версия текста политики конфиденциальности — сохраняется с заявкой (152-ФЗ) */
export const CONSENT_VERSION = "2026-10-20";

export type HallLayout = "banquet" | "buffet" | "lecture";
export const HALL_CAPACITY: Record<HallLayout, number> = { banquet: 14, buffet: 30, lecture: 24 };
export const HALL_BOOKING_DAYS = 365;
export const MONTHLY_ARCHIVE_SIZE = 6;

const shiftDate = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

export const isHallDateAllowed = (date: string, now: Date) => {
  const today = localDate(now, TIMEZONE);
  return date >= shiftDate(today, 1) && date <= shiftDate(today, HALL_BOOKING_DAYS);
};

/** Год действия сертификата: «2026-10-20» → «2027-10-20» (29 февраля — до 28-го) */
export const certificateValidUntil = (now: Date) => {
  const today = localDate(now, TIMEZONE);
  const rest = today.slice(4) === "-02-29" ? "-02-28" : today.slice(4);
  return `${Number(today.slice(0, 4)) + 1}${rest}`;
};

export const requestNumber = (prefix: "R" | "M", sequence: number) => `${prefix}-${String(sequence).padStart(6, "0")}`;
export const certificateSerial = (year: number, sequence: number) => `WB-${year}-${String(sequence).padStart(6, "0")}`;

export interface MonthlyCrate {
  month: string;
  theme: string;
  wines: string[];
  sommelier: string;
}

export class InvalidRequest extends Error {}
