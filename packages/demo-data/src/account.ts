import type { components } from "@wine/contracts/openapi";
import { boutiqueFixtures } from "./boutiques.js";
import { toWineSummary } from "./catalog.js";
import { holdUntilOf, reservationNumber, toZonedIso, zonedInstant } from "./reservations.js";
import { tastingFixtures, toTasting } from "./tastings.js";
import { wineFixtures } from "./wines.js";

type Schemas = components["schemas"];

/**
 * Кабинет гостя из макета Account: Анна Королёва, уровень «Сомелье», ячейка № 204.
 * Моки фронта показывают его гостю с кодом 2015; даты — относительно «сейчас», чтобы бронь всегда была активной.
 * Цены и суммы — плейсхолдеры дизайна (null).
 */

const DAY = 24 * 60 * 60 * 1000;
const TZ = "Europe/Moscow";
const localDay = (instant: Date) => toZonedIso(instant, TZ).slice(0, 10);

export const DEMO_GUEST = {
  id: "mock-anna",
  name: "Анна Королёва",
  phone: "+79165550188",
  cardNumber: "004219880716",
};

const reservationItem = (key: keyof typeof wineFixtures, qty: number): Schemas["ReservationItem"] => {
  const wine = toWineSummary(wineFixtures[key]);
  return { wineId: wine.id, slug: wine.slug, name: wine.name, image: wine.image, qty, price: wine.price };
};

const demoReservation = (
  sequence: number,
  status: Schemas["Reservation"]["status"],
  pickup: Date,
  items: Schemas["ReservationItem"][],
  extended = false
): Schemas["MyReservation"] => {
  const boutique = boutiqueFixtures[0];
  const date = localDay(pickup);
  return {
    id: `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    number: reservationNumber(sequence),
    status,
    createdAt: new Date(pickup.getTime() - DAY).toISOString(),
    pickupAt: toZonedIso(zonedInstant(date, "19:00", boutique.timezone), boutique.timezone),
    holdUntil: toZonedIso(holdUntilOf(boutique, date), boutique.timezone),
    boutique,
    customerName: DEMO_GUEST.name,
    items,
    total: null,
    extended,
  };
};

export const demoReservations = (now: Date): Schemas["MyReservations"] => ({
  active: [
    demoReservation(2611, "active", new Date(now.getTime() + DAY), [
      reservationItem("yquem", 1),
      reservationItem("sassicaia", 2),
      reservationItem("cristal", 1),
    ]),
  ],
  history: [
    demoReservation(2588, "completed", new Date(now.getTime() - 18 * DAY), [reservationItem("chablis", 2)]),
    demoReservation(2510, "completed", new Date(now.getTime() - 36 * DAY), [reservationItem("cristal", 1), reservationItem("madeira", 1)]),
    demoReservation(2390, "completed", new Date(now.getTime() - 100 * DAY), [reservationItem("baroloRiserva", 2)]),
    demoReservation(2301, "completed", new Date(now.getTime() - 139 * DAY), [reservationItem("tokajiAszu", 1), reservationItem("portoVintage", 1)]),
  ],
});

/** Записи гостя: ближайшая открытая дегустация, лист ожидания на заполненную и одна прошедшая */
export const demoTastings = (now: Date): Schemas["MyTastings"] => {
  const all = tastingFixtures(now).map((fixture) => toTasting(fixture, now));
  const upcoming = all.filter((tasting) => tasting.status !== "past");
  const booked = upcoming.find((tasting) => tasting.status === "open");
  const waiting = upcoming.find((tasting) => tasting.status === "full");
  const past = all.filter((tasting) => tasting.status === "past").at(-1);
  return [
    ...(booked ? [{ tasting: booked, kind: "booking" as const, guests: 2 }] : []),
    ...(waiting ? [{ tasting: waiting, kind: "waitlist" as const, guests: 1 }] : []),
    ...(past ? [{ tasting: past, kind: "booking" as const, guests: 1 }] : []),
  ];
};

const bottle = (id: string, key: keyof typeof wineFixtures, name: string, qty: number, sinceDaysAgo: number, readyFrom: number | null, now: Date): Schemas["CellBottle"] => {
  const wine = wineFixtures[key];
  return {
    id,
    name,
    meta: `${wine.region} · ${wine.volume}`,
    image: wine.image,
    qty,
    since: localDay(new Date(now.getTime() - sinceDaysAgo * DAY)),
    photos: qty + 1,
    readyFrom,
  };
};

export const demoCell = (now: Date): Schemas["MyCell"] => ({
  number: "204",
  tier: "medium",
  capacity: 24,
  paidUntil: localDay(new Date(now.getTime() + 361 * DAY)),
  conditions: { temperature: 12.8, humidity: 71 },
  bottles: [
    bottle("yquem", "yquem", "Château d’Yquem 1988", 1, 1300, null, now),
    bottle("barolo", "baroloRiserva", "Бароло Ризерва 2010", 1, 1010, null, now),
    bottle("porto", "portoVintage", "Портвейн Винтаж 2003", 1, 740, null, now),
    bottle("sassicaia", "sassicaia", "Sassicaia 2015", 2, 520, 2028, now),
    bottle("burgundy", "gevreyChambertin", "Бургундия Гран Крю 2018", 3, 400, 2030, now),
    bottle("tokaji", "tokajiAszu", "Токай Асу 6 путтоньош 2013", 1, 250, 2029, now),
  ],
  preparation: null,
});

export const demoMonthly = (): Schemas["MonthlySubscription"] => ({ number: "M-000042", plan: "classic", boutiqueId: "street", status: "active", skipMonth: null });

export const demoCertificates = (now: Date): Schemas["MyCertificates"] => [
  { serial: "WB-2026-000315", nominal: 10_000, balance: 6_500, validUntil: localDay(new Date(now.getTime() + 146 * DAY)), from: "Михаила", status: "active" },
];

export const demoLoyalty = (now: Date): Schemas["Loyalty"] => ({
  balance: 2_480,
  level: "sommelier",
  bottles: 18,
  nextLevel: { level: "cellar", bottles: 24 },
  history: [
    { id: "b5", at: new Date(now.getTime() - 18 * DAY).toISOString(), title: "Покупка WB-002588", amount: 310 },
    { id: "b4", at: new Date(now.getTime() - 30 * DAY).toISOString(), title: "Списание при оплате WB-002510", amount: -800 },
    { id: "b3", at: new Date(now.getTime() - 36 * DAY).toISOString(), title: "Покупка WB-002510", amount: 540 },
    { id: "b2", at: new Date(now.getTime() - 65 * DAY).toISOString(), title: "Подарок ко дню рождения клуба", amount: 500 },
    { id: "b1", at: new Date(now.getTime() - 100 * DAY).toISOString(), title: "Покупка WB-002390", amount: 620 },
  ],
});

export const demoFavorites = (): Schemas["MyFavorites"] =>
  (["cristal", "chablis", "yquem", "barolo", "madeira", "tokajiEssencia"] as const).map((key) => toWineSummary(wineFixtures[key]));

export const demoProfile = (now: Date, current = true): Schemas["Profile"] => ({
  id: DEMO_GUEST.id,
  name: DEMO_GUEST.name,
  phone: DEMO_GUEST.phone,
  email: "anna@mail.ru",
  birthDate: "1990-10-16",
  cardNumber: DEMO_GUEST.cardNumber,
  favoriteBoutiqueId: "street",
  tastes: ["red_dry", "aged", "burgundy"],
  notifications: {
    reservations: { sms: true, email: true },
    tastings: { sms: true, email: false },
    arrivals: { sms: false, email: true },
    cell: { sms: true, email: true },
    monthly: { sms: true, email: false },
  },
  sessions: [
    { id: "this", device: "Этот браузер", current, lastSeenAt: now.toISOString() },
    { id: "iphone", device: "Safari · iPhone", current: false, lastSeenAt: new Date(now.getTime() - DAY).toISOString() },
  ],
});

/** Уровни клуба: сколько бутылок за 12 месяцев, процент бонусов и привилегия */
export const LOYALTY_LEVELS: { level: Schemas["LoyaltyLevel"]; bottles: number; percent: number }[] = [
  { level: "guest", bottles: 0, percent: 3 },
  { level: "connoisseur", bottles: 6, percent: 5 },
  { level: "sommelier", bottles: 12, percent: 7 },
  { level: "cellar", bottles: 24, percent: 10 },
];

/** Приветственные бонусы новой карте гостя */
export const WELCOME_BONUS = 500;
