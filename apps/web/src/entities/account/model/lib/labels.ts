import type { LoyaltyLevel, NotificationPrefs, TasteTag } from "../types";

/** Уровни клуба (макет Account): порог бутылок за 12 месяцев, процент бонусов, привилегия */
export const LOYALTY_LEVELS: Record<LoyaltyLevel, { title: string; requirement: string; percent: string; perk: string }> = {
  guest: { title: "Гость", requirement: "с регистрации", percent: "3%", perk: "бонусы с покупок" },
  connoisseur: { title: "Ценитель", requirement: "от 6 бутылок", percent: "5%", perk: "+ ранний доступ к поставкам" },
  sommelier: { title: "Сомелье", requirement: "от 12 бутылок", percent: "7%", perk: "+ дегустация в подарок раз в год" },
  cellar: { title: "Погреб", requirement: "от 24 бутылок", percent: "10%", perk: "+ ячейка −20%, закрытые аукционы" },
};

export const LOYALTY_LEVEL_ORDER = Object.keys(LOYALTY_LEVELS) as LoyaltyLevel[];

export const TASTES: Record<TasteTag, string> = {
  red_dry: "Красные сухие",
  white_mineral: "Белые минеральные",
  sparkling: "Игристые",
  sweet: "Сладкие",
  aged: "Выдержанные 10+",
  burgundy: "Бургундия",
  italy: "Италия",
  natural: "Натуральные",
};

export const NOTIFICATION_TOPICS: Record<keyof NotificationPrefs, string> = {
  reservations: "Статус брони",
  tastings: "Дегустации и напоминания",
  arrivals: "Новые поставки",
  cell: "Ячейка: срок хранения",
  monthly: "Набор месяца",
};

/** «Анна Королёва» → «Анна» — приветствие */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Приветствие по часам гостя */
export const greeting = (hour = new Date().getHours()) =>
  hour < 5 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 17 ? "Добрый день" : "Добрый вечер";

/** «2026-10-19T22:00:00+03:00» → «19 окт, 22:00» — по часам бутика, без пересчёта в пояс гостя */
const SHORT_MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
export const formatShortMoment = (iso: string) => `${Number(iso.slice(8, 10))} ${SHORT_MONTHS[Number(iso.slice(5, 7)) - 1]}, ${iso.slice(11, 16)}`;
export const formatShortDate = (iso: string) => `${Number(iso.slice(8, 10))} ${SHORT_MONTHS[Number(iso.slice(5, 7)) - 1]}`;
/** «2027-10-16» → «16.10.2027» */
export const formatDots = (date: string) => date.slice(0, 10).split("-").reverse().join(".");
