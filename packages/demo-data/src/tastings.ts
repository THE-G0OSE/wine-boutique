import type { components } from "@wine/contracts/openapi";
import { toZonedIso, weekdayOf, zonedInstant } from "./reservations.js";

/**
 * Эталон афиши дегустаций — так отвечают моки фронта и это кладёт в базу сид сервиса tastings:
 * - афиша макета (октябрь 2026) раскладывается на любой месяц по правилу «n-я пятница, n-е воскресенье…»:
 *   октябрь получается ровно как в макете, в месяце без пятой пятницы её дегустации нет;
 * - в афише — текущий месяц и два следующих по часам погреба;
 * - занятые места — как в макете (гости, записавшиеся раньше), дальше их прибавляют записи;
 * - статус: началась — past, мест нет — full, иначе open.
 */

type Tasting = components["schemas"]["Tasting"];
type TastingKind = components["schemas"]["TastingKind"];

export const TASTING_TIMEZONE = "Europe/Moscow";
export const TASTING_CAPACITY = 12;
/** Сколько месяцев в афише, считая текущий */
export const TASTING_MONTHS = 3;
/** Гостей в одной записи — не больше */
export const TASTING_MAX_GUESTS = 6;

const DURATION: Record<TastingKind, number> = { vertical: 120, blind: 120, dinner: 180, masterclass: 90 };

export const TASTING_DESCRIPTIONS: Record<TastingKind, string> = {
  vertical: "Одно хозяйство — несколько лет урожая подряд. Сравниваем, как вино меняется со временем.",
  blind: "Бутылки в чехлах: угадываем страну, сорт и год. Победителю — бутылка из погреба.",
  dinner: "Пять подач от шефа, к каждой — своё вино. Камерный стол при свечах.",
  masterclass: "Практика для начинающих: дегустационный лист, аромат, послевкусие.",
};

interface TastingTemplate {
  /** Какая по счёту в месяце: 1-я … 5-я */
  nth: number;
  /** 1 — понедельник … 7 — воскресенье */
  weekday: number;
  kind: TastingKind;
  title: string;
  time: string;
  wines: number;
  /** Мест уже занято — как в макете */
  taken: number;
}

/** Октябрь 2026 из макета: 2 и 4 — первые пятница и воскресенье, 17 — третья суббота… */
const TEMPLATES: TastingTemplate[] = [
  { nth: 1, weekday: 5, kind: "vertical", title: "Пять урожаев одного шато", time: "19:30", wines: 5, taken: 8 },
  { nth: 1, weekday: 7, kind: "masterclass", title: "Как читать этикетку", time: "15:00", wines: 4, taken: 3 },
  { nth: 2, weekday: 5, kind: "blind", title: "Бордо против Тосканы", time: "19:30", wines: 6, taken: 12 },
  { nth: 2, weekday: 7, kind: "dinner", title: "Трюфели и неббиоло", time: "20:00", wines: 5, taken: 5 },
  { nth: 3, weekday: 5, kind: "vertical", title: "Шампань: 1996–2012", time: "19:30", wines: 6, taken: 10 },
  { nth: 3, weekday: 6, kind: "masterclass", title: "Декантация и бокалы", time: "15:00", wines: 3, taken: 6 },
  { nth: 3, weekday: 6, kind: "blind", title: "Угадай сорт", time: "19:00", wines: 6, taken: 2 },
  { nth: 4, weekday: 5, kind: "dinner", title: "Осенняя дичь и пино нуар", time: "20:00", wines: 5, taken: 12 },
  { nth: 4, weekday: 7, kind: "blind", title: "Старый Свет vs Новый", time: "17:00", wines: 6, taken: 4 },
  { nth: 5, weekday: 5, kind: "vertical", title: "Портвейн: 10, 20, 30, 40", time: "19:30", wines: 4, taken: 7 },
];

/** Дегустация для сида: без вычисляемых мест и статуса */
export interface TastingFixture {
  id: string;
  kind: TastingKind;
  title: string;
  description: string;
  startsAt: Date;
  durationMinutes: number;
  wines: number;
  capacity: number;
  /** Занято до первой записи через сайт */
  seatsTaken: number;
  /** Копейки за гостя; null — цена не назначена (в макете — [цена] ₽) */
  priceKopecks: number | null;
  host: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** «2026-10» + n месяцев */
export const addMonths = (month: string, months: number) => {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
};

export const daysInMonth = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

/** Месяцы афиши: текущий по часам погреба и следующие */
export const tastingMonths = (now: Date): string[] => {
  const current = toZonedIso(now, TASTING_TIMEZONE).slice(0, 7);
  return Array.from({ length: TASTING_MONTHS }, (_, index) => addMonths(current, index));
};

/** «2026-10-17» + «19:00» → «2026-10-17-1900» */
export const tastingId = (date: string, time: string) => `${date}-${time.replace(":", "")}`;

/** Дегустации месяца по афише макета — без учёта записей */
export const tastingSchedule = (month: string): TastingFixture[] => {
  const length = daysInMonth(month);
  return TEMPLATES.flatMap((template) => {
    const first = weekdayOf(`${month}-01`);
    const day = 1 + ((template.weekday - first + 7) % 7) + (template.nth - 1) * 7;
    if (day > length) return [];
    const date = `${month}-${pad(day)}`;
    return [
      {
        id: tastingId(date, template.time),
        kind: template.kind,
        title: template.title,
        description: TASTING_DESCRIPTIONS[template.kind],
        startsAt: zonedInstant(date, template.time, TASTING_TIMEZONE),
        durationMinutes: DURATION[template.kind],
        wines: template.wines,
        capacity: TASTING_CAPACITY,
        seatsTaken: template.taken,
        priceKopecks: null,
        host: "[имя сомелье]",
      },
    ];
  }).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.id.localeCompare(b.id));
};

/** Все дегустации афиши — для сида */
export const tastingFixtures = (now: Date) => tastingMonths(now).flatMap(tastingSchedule);

export const tastingStatus = (startsAt: Date, seatsLeft: number, now: Date): Tasting["status"] =>
  startsAt.getTime() <= now.getTime() ? "past" : seatsLeft === 0 ? "full" : "open";

/** Дегустация в формате API; `extraTaken` — места, занятые записями поверх макета */
export const toTasting = (fixture: TastingFixture, now: Date, extraTaken = 0): Tasting => {
  const seatsLeft = Math.max(0, fixture.capacity - fixture.seatsTaken - extraTaken);
  return {
    id: fixture.id,
    kind: fixture.kind,
    title: fixture.title,
    description: fixture.description,
    startsAt: toZonedIso(fixture.startsAt, TASTING_TIMEZONE),
    durationMinutes: fixture.durationMinutes,
    wines: fixture.wines,
    capacity: fixture.capacity,
    seatsLeft,
    price: fixture.priceKopecks === null ? null : Math.round(fixture.priceKopecks / 100),
    host: fixture.host,
    status: tastingStatus(fixture.startsAt, seatsLeft, now),
  };
};

/** GET /tastings?month= — месяц вне афиши пустой */
export const listTastings = (month: string, now: Date, extraTaken: (id: string) => number = () => 0): Tasting[] =>
  tastingMonths(now).includes(month) ? tastingSchedule(month).map((fixture) => toTasting(fixture, now, extraTaken(fixture.id))) : [];

/** Дегустация афиши по id; null — нет такой */
export const findTastingFixture = (id: string, now: Date): TastingFixture | null =>
  tastingFixtures(now).find((fixture) => fixture.id === id) ?? null;
