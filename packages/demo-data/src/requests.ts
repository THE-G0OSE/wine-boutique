import type { components } from "@wine/contracts/openapi";

type HallLayout = components["schemas"]["HallLayout"];
type MonthlyCrate = components["schemas"]["MonthlyCrate"];
type MonthlyCrates = components["schemas"]["MonthlyCrates"];

/**
 * Ящики «Набора месяца» из макета Monthly: октябрь 2026 — текущий (записка на ящике), остальные — архив.
 * Имя сомелье — плейсхолдер дизайна.
 */
export const monthlyCrateFixtures: MonthlyCrate[] = [
  { month: "2026-10", theme: "Вина у камина", wines: ["Тосканский купаж", "Рислинг из Мозеля", "Пино нуар Бургундии"], sommelier: "[имя сомелье]" },
  { month: "2026-09", theme: "Урожай и сбор", wines: ["Божоле нуво", "Гюзель из Вахау", "Молодое кьянти"], sommelier: "[имя сомелье]" },
  { month: "2026-08", theme: "Белые на террасе", wines: ["Альбариньо", "Сансер", "Верментино"], sommelier: "[имя сомелье]" },
  { month: "2026-07", theme: "Розовое лето", wines: ["Прованс розе", "Тавель", "Розе из Риохи"], sommelier: "[имя сомелье]" },
  { month: "2026-06", theme: "Игристые не из Шампани", wines: ["Франчакорта", "Кава", "Креман д’Эльзас"], sommelier: "[имя сомелье]" },
  { month: "2026-05", theme: "Пино нуар вокруг света", wines: ["Бургундия", "Орегон", "Отаго"], sommelier: "[имя сомелье]" },
  { month: "2026-04", theme: "Вина вулканов", wines: ["Этна Россо", "Санторини", "Тенерифе"], sommelier: "[имя сомелье]" },
];

/** Сколько прошлых ящиков в архиве */
export const MONTHLY_ARCHIVE_SIZE = 6;

/**
 * GET /monthly: текущий — самый свежий ящик не позже месяца `now` (по Москве), архив — шесть предыдущих.
 * Ящики идут от новых к старым.
 */
export const monthlyCrates = (crates: MonthlyCrate[], now: Date): MonthlyCrates | null => {
  const month = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit" }).format(now);
  const sorted = crates.filter((crate) => crate.month <= month).sort((a, b) => b.month.localeCompare(a.month));
  if (!sorted.length) return null;
  return { current: sorted[0], archive: sorted.slice(1, 1 + MONTHLY_ARCHIVE_SIZE) };
};

/** Номер заявки для звонка менеджера: «R-000123» */
export const requestNumber = (sequence: number) => `R-${String(sequence).padStart(6, "0")}`;

/** Номер сертификата: «WB-2026-000123» — год оформления и сквозной номер */
export const certificateSerial = (year: number, sequence: number) => `WB-${year}-${String(sequence).padStart(6, "0")}`;

/** Вместимость зала по рассадке (макет Hall) */
export const HALL_CAPACITY: Record<HallLayout, number> = { banquet: 14, buffet: 30, lecture: 24 };
/** На сколько дней вперёд принимаем заявки на зал */
export const HALL_BOOKING_DAYS = 365;

/** Дата зала подходит: с завтрашнего дня по Москве и не дальше года */
export const isHallDateAllowed = (date: string, now: Date) => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const [y, m, d] = today.split("-").map(Number);
  const shift = (days: number) => new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
  return date >= shift(1) && date <= shift(HALL_BOOKING_DAYS);
};

/** Сертификат действует год: 20.10.2026 → 20.10.2027 по Москве */
export const certificateValidUntil = (now: Date) => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  // 29 февраля через год нет — до 28-го
  return `${Number(today.slice(0, 4)) + 1}${today.slice(4) === "-02-29" ? "-02-28" : today.slice(4)}`;
};
