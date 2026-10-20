import type { components } from "@wine/contracts/openapi";

type CellarCell = components["schemas"]["CellarCell"];
type CellarTier = components["schemas"]["CellarTier"];

/**
 * Стена погреба из макета CellarStorage: четыре ряда по восемь ячеек.
 * Верхний ряд — малые, два средних — средние, нижний — большие; номер на табличке — «ряд + место» (101 … 408).
 * Занятые — как в макете. Цены — плейсхолдер дизайна ([цена] ₽ → null).
 */

export const CELLAR_ROWS = 4;
export const CELLAR_COLUMNS = 8;

const TIER_OF_ROW: CellarTier[] = ["small", "medium", "medium", "large"];
export const CELLAR_CAPACITY: Record<CellarTier, number> = { small: 12, medium: 24, large: 48 };

/** Занятые места по порядку на стене (0 — левая верхняя), как в макете */
const BUSY = new Set([1, 2, 5, 9, 10, 13, 14, 18, 21, 22, 26, 27, 30]);

export const cellarCellFixtures: CellarCell[] = Array.from({ length: CELLAR_ROWS * CELLAR_COLUMNS }, (_, index) => {
  const row = Math.floor(index / CELLAR_COLUMNS) + 1;
  const tier = TIER_OF_ROW[row - 1];
  return {
    number: String(row * 100 + (index % CELLAR_COLUMNS) + 1),
    row,
    tier,
    capacity: CELLAR_CAPACITY[tier],
    status: BUSY.has(index) ? "busy" : "free",
    pricePerMonth: null,
  };
});
