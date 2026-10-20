import { cellarYears, isPlaceholder, type WineCategory, type WineShelf } from "./wine.js";

/** Выдержка по годам в погребе: up_to_3 — до 3 лет, from_3_to_10, from_10_to_20, over_20 — 20+ лет */
export type WineAge = "up_to_3" | "from_3_to_10" | "from_10_to_20" | "over_20";

export const WINE_AGES: WineAge[] = ["up_to_3", "from_3_to_10", "from_10_to_20", "over_20"];

/** Фильтры каталога — общие для списка, фасетов и полок */
export interface WineFilter {
  shelf?: WineShelf;
  category?: WineCategory;
  q?: string;
  country?: string[];
  grape?: string[];
  /** Цена, ₽: вина без цены под ценовой фильтр не попадают */
  priceMin?: number;
  priceMax?: number;
  age?: WineAge[];
  volumeMl?: number[];
}

export const ageOf = (years: number | null): WineAge | null => {
  if (years === null) return null;
  if (years < 3) return "up_to_3";
  if (years < 10) return "from_3_to_10";
  if (years < 20) return "from_10_to_20";
  return "over_20";
};

/** Группы фильтра, у которых есть счётчики */
export type FacetGroup = "country" | "grape" | "price" | "age" | "volume";

/** Колонки вина, по которым считаются фасеты */
export interface FacetRow {
  country: string | null;
  grapes: string[];
  volumeMl: number;
  priceKopecks: number | null;
  cellaredAt: Date | null;
}

const rubles = (kopecks: number) => Math.round(kopecks / 100);

/** Подходит ли вино под фильтры, кроме группы `except` (полка, тип и поиск уже применены выборкой) */
export const matchesFacetFilter = (row: FacetRow, filter: WineFilter, today: Date, except?: FacetGroup): boolean => {
  if (except !== "country" && filter.country?.length && !(row.country && filter.country.includes(row.country))) return false;
  if (except !== "grape" && filter.grape?.length && !row.grapes.some((grape) => filter.grape!.includes(grape))) return false;
  if (except !== "price" && (filter.priceMin !== undefined || filter.priceMax !== undefined)) {
    if (row.priceKopecks === null) return false;
    const price = rubles(row.priceKopecks);
    if (filter.priceMin !== undefined && price < filter.priceMin) return false;
    if (filter.priceMax !== undefined && price > filter.priceMax) return false;
  }
  if (except !== "age" && filter.age?.length) {
    const age = ageOf(cellarYears(row.cellaredAt, today));
    if (!age || !filter.age.includes(age)) return false;
  }
  if (except !== "volume" && filter.volumeMl?.length && !filter.volumeMl.includes(row.volumeMl)) return false;
  return true;
};

export interface WineFacets {
  total: number;
  countries: { value: string; count: number }[];
  grapes: { value: string; count: number }[];
  ages: { value: WineAge; count: number }[];
  volumes: { value: number; count: number }[];
  price: { min: number; max: number } | null;
}

const countBy = <T extends string | number>(rows: FacetRow[], values: (row: FacetRow) => T[]) => {
  const counts = new Map<T, number>();
  for (const row of rows) for (const value of new Set(values(row))) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
};

const byCountThenName = (a: { value: string; count: number }, b: { value: string; count: number }) =>
  b.count - a.count || a.value.localeCompare(b.value, "ru");

/**
 * Счётчики фильтров: вариант считается со всеми фильтрами, кроме своей группы —
 * выбранная страна не обнуляет счётчики других стран. `rows` — вина полки и поиска без остальных фильтров.
 */
export const countFacets = (rows: FacetRow[], filter: WineFilter, today: Date): WineFacets => {
  const except = (group: FacetGroup) => rows.filter((row) => matchesFacetFilter(row, filter, today, group));
  const countries = countBy(except("country"), (row) => (row.country && !isPlaceholder(row.country) ? [row.country] : []));
  const grapes = countBy(except("grape"), (row) => row.grapes.filter((grape) => !isPlaceholder(grape)));
  const ages = countBy(except("age"), (row) => {
    const age = ageOf(cellarYears(row.cellaredAt, today));
    return age ? [age] : [];
  });
  const volumes = countBy(except("volume"), (row) => [row.volumeMl]);
  const prices = except("price").flatMap((row) => (row.priceKopecks === null ? [] : [rubles(row.priceKopecks)]));
  return {
    total: rows.filter((row) => matchesFacetFilter(row, filter, today)).length,
    countries: [...countries].map(([value, count]) => ({ value, count })).sort(byCountThenName),
    grapes: [...grapes].map(([value, count]) => ({ value, count })).sort(byCountThenName),
    ages: WINE_AGES.map((value) => ({ value, count: ages.get(value) ?? 0 })),
    volumes: [...volumes].map(([value, count]) => ({ value, count })).sort((a, b) => a.value - b.value),
    price: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
  };
};

/** Даты «в погребе с»: выдержка от `minYears` (включительно) до `maxYears` (не включая) — для запроса в базу */
export const cellaredRange = (age: WineAge, today: Date): { after?: Date; notAfter?: Date } => {
  const yearsAgo = (years: number) => new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
  const bounds: Record<WineAge, [number, number | null]> = {
    up_to_3: [0, 3],
    from_3_to_10: [3, 10],
    from_10_to_20: [10, 20],
    over_20: [20, null],
  };
  const [min, max] = bounds[age];
  // Полных лет ≥ min ⇔ в погребе с даты не позже today − min; < max ⇔ позже today − max
  return { notAfter: yearsAgo(min), after: max === null ? undefined : yearsAgo(max) };
};
