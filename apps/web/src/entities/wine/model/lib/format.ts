import { formatPrice } from "@/shared/lib/formatPrice";
import { plural } from "@/shared/lib/plural";
import type { WineCategory, WineShelf, WineSummary } from "../types";

/** «Сотерн, Франция · семильон, совиньон блан» */
export const formatWineOrigin = (wine: WineSummary) =>
  [[wine.region, wine.country].filter(Boolean).join(", "), wine.grapes.join(", ")].filter(Boolean).join(" · ");

/** «Тоскана · каберне совиньон, каберне фран» */
export const formatWineRegionGrapes = (wine: WineSummary) =>
  [wine.region, wine.grapes.join(", ")].filter(Boolean).join(" · ");

/** «Сотерн · 0,75 л» */
export const formatWineRegionVolume = (wine: WineSummary) => `${wine.region} · ${wine.volume}`;

/** «38 лет в погребе»; без данных — плейсхолдер из дизайна */
export const formatCellarAge = (years: number | null) =>
  years === null ? "[N] лет в погребе" : `${years} ${plural(years, ["год", "года", "лет"])} в погребе`;

/** Цена ещё не назначена — плейсхолдер из дизайна */
export const formatWinePrice = (price: number | null) => (price === null ? "[цена] ₽" : formatPrice(price));

export const WINE_CATEGORY_LABELS: Record<WineCategory, string> = {
  red: "Красные",
  white: "Белые",
  sparkling: "Игристые",
  sweet: "Сладкие",
};

/**
 * Подпись на бирке бутылки: на десктопе — регион и сорта, на мобильных — только регион (MShop).
 * На полке «10+ лет» вместо сортов — срок в погребе, если он известен («Сотерн · 38 лет в погребе»)
 */
export const formatShelfMeta = (wine: WineSummary, { shelf, compact = false }: { shelf?: WineShelf; compact?: boolean } = {}) => {
  if (shelf === "aged" && wine.cellarYears !== null) return `${wine.region} · ${formatCellarAge(wine.cellarYears)}`;
  return compact ? wine.region : formatWineRegionGrapes(wine);
};
