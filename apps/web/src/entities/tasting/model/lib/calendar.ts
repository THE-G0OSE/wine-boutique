import { plural } from "@/shared/lib/plural";

/** Часовой пояс погреба: даты и время дегустаций — по нему, где бы ни был гость */
export const CELLAR_TIMEZONE = "Europe/Moscow";

const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const MONTHS_GENITIVE = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

const pad = (n: number) => String(n).padStart(2, "0");

/** Сегодня по часам погреба: «2026-10-20» */
export const cellarToday = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: CELLAR_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);

/** «2026-10» + n месяцев */
export const shiftMonth = (month: string, months: number) => {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
};

export const isMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

/** «Октябрь 2026» */
export const formatMonth = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  const name = MONTHS[m - 1];
  return `${name[0].toUpperCase()}${name.slice(1)} ${y}`;
};

/** «17 октября» */
export const formatDay = (date: string) => {
  const [, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS_GENITIVE[m - 1]}`;
};

/** Дата и время начала из ISO со смещением погреба: «2026-10-17T19:00:00+03:00» → «2026-10-17», «19:00» */
export const tastingDate = (startsAt: string) => startsAt.slice(0, 10);
export const tastingTime = (startsAt: string) => startsAt.slice(11, 16);

/** «1,5 часа», «2 часа», «3 часа» */
export const formatDuration = (minutes: number) => {
  const hours = minutes / 60;
  return `${String(hours).replace(".", ",")} ${Number.isInteger(hours) ? plural(hours, ["час", "часа", "часов"]) : "часа"}`;
};

/**
 * Сетка месяца с понедельника: дни месяца и пустые клетки до первого числа и после последнего,
 * по семь в ряд (пять или шесть рядов)
 */
export const monthGrid = (month: string): (string | null)[] => {
  const [y, m] = month.split("-").map(Number);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= length; day++) cells.push(`${month}-${pad(day)}`);
  while (cells.length % 7) cells.push(null);
  return cells;
};
