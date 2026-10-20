import type { ApiSchemas } from "@/shared/api";

export type GiftPack = ApiSchemas["GiftPack"];
export type GiftExtra = ApiSchemas["GiftExtra"];
export type GiftRun = ApiSchemas["GiftRun"];

/** Собранный подарок — то, что видно в превью и уходит в заявку */
export interface GiftBox {
  pack: GiftPack;
  bottles: number;
  extras: GiftExtra[];
  engraving: string;
  run: GiftRun;
}

/** Упаковки (макеты Gifts и MGifts): на мобильных подписи короче */
export const GIFT_PACKS: Record<GiftPack, { title: string; short: string }> = {
  wooden: { title: "Деревянный ящик", short: "Ящик" },
  tube: { title: "Чёрный тубус", short: "Тубус" },
  kraft: { title: "Крафт-коробка", short: "Крафт" },
};

export const GIFT_EXTRAS: Record<GiftExtra, { title: string; short: string }> = {
  glasses: { title: "Пара бокалов", short: "Пара бокалов" },
  chocolate: { title: "Горький шоколад", short: "Горький шоколад" },
  logo: { title: "Логотип на ящике (выжиг)", short: "Логотип на ящике" },
};

export const GIFT_RUNS: Record<GiftRun, { title: string; note: string }> = {
  from10: { title: "от 10", note: "подбор сомелье" },
  from50: { title: "от 50", note: "−7%" },
  from100: { title: "от 100", note: "−12%" },
};

export const GIFT_MAX_BOTTLES = 3;
export const GIFT_ENGRAVING_LENGTH = 40;
export const GIFT_DEFAULT_ENGRAVING = "С благодарностью за год";

/** Как в макете: деревянный ящик, две бутылки, бокалы и логотип */
export const DEFAULT_GIFT: GiftBox = { pack: "wooden", bottles: 2, extras: ["glasses", "logo"], engraving: "", run: "from10" };
