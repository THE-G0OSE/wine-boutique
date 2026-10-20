/**
 * Клуб гостей:
 * - уровень — по бутылкам за последние 12 месяцев: гость с регистрации, ценитель от 6, сомелье от 12, погреб от 24;
 * - новой карте — 500 приветственных бонусов (одна проводка «welcome», повтор не начисляет);
 * - баланс — сумма проводок. Покупки и списания придут событиями из бутика (с сервисом заказов).
 */

export type LoyaltyLevel = "guest" | "connoisseur" | "sommelier" | "cellar";

export const LEVELS: { level: LoyaltyLevel; bottles: number }[] = [
  { level: "guest", bottles: 0 },
  { level: "connoisseur", bottles: 6 },
  { level: "sommelier", bottles: 12 },
  { level: "cellar", bottles: 24 },
];

export const WELCOME_BONUS = 500;
export const WELCOME_REFERENCE = "welcome";

export const levelOf = (bottles: number) => {
  const index = LEVELS.findLastIndex((level) => bottles >= level.bottles);
  return { level: LEVELS[index].level, next: LEVELS[index + 1] ?? null };
};

export interface BonusEntry {
  id: string;
  at: Date;
  title: string;
  amount: number;
}

/** Вино для избранного — как в списках публичного API */
export interface FavoriteWine {
  id: string;
  slug: string;
  name: string;
  categories: string[];
  region: string;
  country: string | null;
  grapes: string[];
  volumeMl: number;
  vintage: number | null;
  cellarYears: number | null;
  priceKopecks: number | null;
  imageUrl: string;
  bottle: string;
}

export class UnknownWine extends Error {}
