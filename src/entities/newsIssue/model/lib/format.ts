import type { NewsAfishaItem, NewsRubric } from "../types";

export const NEWS_RUBRIC_LABELS: Record<NewsRubric, string> = {
  supply: "Поставки",
  harvest: "Урожай",
  tasting: "Дегустации",
  events: "События",
};

export const NEWS_RUBRICS = Object.keys(NEWS_RUBRIC_LABELS) as NewsRubric[];

export const isNewsRubric = (value: string | null): value is NewsRubric =>
  value !== null && (NEWS_RUBRICS as string[]).includes(value);

const dayMonth = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
const dayMonthShort = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });
const weekday = new Intl.DateTimeFormat("ru-RU", { weekday: "long" });
const time = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

/** "2026-10-16" как местная дата, без сдвига часового пояса */
const parseDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`);

/** Номер выпуска; пока не присвоен — плейсхолдер из дизайна */
export const formatIssueNumber = (number: number | null) => (number === null ? "[N]" : String(number));

/** «Пятница, 16 октября 2026 года» — строка под шапкой газеты */
export const formatIssueDateLong = (isoDate: string) => {
  const date = parseDate(isoDate);
  const day = weekday.format(date);
  return `${day[0].toUpperCase()}${day.slice(1)}, ${dayMonth.format(date)} ${date.getFullYear()} года`;
};

/** «16 октября 2026» */
export const formatIssueDateShort = (isoDate: string) => {
  const date = parseDate(isoDate);
  return `${dayMonth.format(date)} ${date.getFullYear()}`;
};

/** Когда событие: «23 октября, 20:00»; дата ещё не назначена — плейсхолдер */
export const formatEventWhen = (startsAt: string | null) => {
  if (startsAt === null) return "[дата], [время]";
  const date = new Date(startsAt);
  return `${dayMonth.format(date)}, ${time.format(date)}`;
};

/** Дата в афише: «17 окт.» */
export const formatAfishaDate = (startsAt: string | null) =>
  startsAt === null ? "[дата]" : dayMonthShort.format(new Date(startsAt));

/** Места в афише: прочерк — без ограничения, плейсхолдер — число ещё не известно */
export const formatAfishaSeats = ({ capacityLimited, seats }: Pick<NewsAfishaItem, "capacityLimited" | "seats">) => {
  if (!capacityLimited) return "—";
  return seats === null ? "[N]" : String(seats);
};

/** Число мест в анонсе события */
export const formatSeats = (seats: number | null) => (seats === null ? "[N]" : String(seats));
