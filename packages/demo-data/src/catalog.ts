import type { components } from "@wine/contracts/openapi";
import type { ShelfFixture, WineDetails, WineFixture, WineShelf, WineSummary } from "./types.js";
import { shelfFixtures, wineFixtureList } from "./wines.js";

/**
 * Эталон запросов каталога над демо-данными: так отвечают моки MSW, и с этим же сверяются тесты сервиса catalog.
 * Правила (совпадают с сервисом):
 * - поиск — все слова запроса есть в названии, сортах, регионе, стране, винодельне или апелласьоне; регистр и «ё» не важны;
 * - счётчик варианта фильтра — с учётом всех фильтров, кроме фильтров своей группы;
 * - плейсхолдеры дизайна («[сорт]», «[регион]») в фильтрах и подсказках не показываются;
 * - подсказки: до трёх вин, до четырёх сортов (в названии есть запрос) и регионов (см. suggestedRegions);
 * - popular на полке — порядок полки, вне полки — общий порядок; остальные сортировки — с null в конце, при равенстве — popular.
 */

type Schemas = components["schemas"];
type WineSort = Schemas["WineSort"];
type WineAge = Schemas["WineAge"];
type WineCategory = Schemas["WineCategory"];

export interface WineFilter {
  shelf?: WineShelf;
  category?: WineCategory;
  q?: string;
  country?: string[];
  grape?: string[];
  priceMin?: number;
  priceMax?: number;
  age?: WineAge[];
  volume?: number[];
}

export interface WineListQuery extends WineFilter {
  sort?: WineSort;
  limit?: number;
  offset?: number;
}

const SUMMARY_KEYS = [
  "id", "slug", "name", "categories", "region", "country", "grapes", "volume", "vintage", "cellarYears", "price", "image", "bottle",
] as const satisfies readonly (keyof WineSummary)[];

/** Вино в формате списков контракта — без полей карточки */
export const toWineSummary = (wine: WineFixture): WineSummary =>
  Object.fromEntries(SUMMARY_KEYS.map((key) => [key, wine[key]])) as WineSummary;

/** «0,75 л» → 750 */
export const volumeMlOf = (volume: string): number => Math.round(Number.parseFloat(volume.replace(",", ".")) * 1000);

/** Выдержка по годам в погребе; вино без срока ни в одну группу не попадает */
export const ageOf = (cellarYears: number | null): WineAge | null => {
  if (cellarYears === null) return null;
  if (cellarYears < 3) return "up_to_3";
  if (cellarYears < 10) return "from_3_to_10";
  if (cellarYears < 20) return "from_10_to_20";
  return "over_20";
};

export const WINE_AGES: WineAge[] = ["up_to_3", "from_3_to_10", "from_10_to_20", "over_20"];

const isPlaceholder = (value: string) => value.startsWith("[");
export const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");

const searchText = (wine: WineFixture) =>
  normalize([wine.name, wine.region, wine.country ?? "", ...wine.grapes, wine.producer ?? "", wine.appellation ?? ""].join(" "));

export const matchesQuery = (wine: WineFixture, q: string): boolean => {
  const haystack = searchText(wine);
  return normalize(q).split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
};

const shelfById = new Map<WineShelf, ShelfFixture>(shelfFixtures.map((shelf) => [shelf.id, shelf]));

/**
 * Порядок поступления в бутик (сортировка new — «новинки»): дат поступления в макетах нет, поэтому свежие урожаи
 * считаются пришедшими позже, вина без года — в общем порядке. Сид сервиса ставит даты поступления по этому же порядку.
 */
const arrivalOrder = [...wineFixtureList].sort((a, b) => (b.vintage ?? -Infinity) - (a.vintage ?? -Infinity)).map((wine) => wine.slug);
/** 0 — пришло последним (самая свежая новинка) */
export const arrivalRankOf = (slug: string) => arrivalOrder.indexOf(slug);
const wineBySlug = new Map(wineFixtureList.map((wine) => [wine.slug, wine]));

type FacetGroup = "country" | "grape" | "price" | "age" | "volume";

const matches = (wine: WineFixture, filter: WineFilter, except?: FacetGroup): boolean => {
  if (filter.shelf && !shelfById.get(filter.shelf)?.slugs.includes(wine.slug)) return false;
  if (filter.category && !wine.categories.includes(filter.category)) return false;
  if (filter.q && !matchesQuery(wine, filter.q)) return false;
  if (except !== "country" && filter.country?.length && !(wine.country && filter.country.includes(wine.country))) return false;
  if (except !== "grape" && filter.grape?.length && !wine.grapes.some((grape) => filter.grape!.includes(grape))) return false;
  if (except !== "price" && (filter.priceMin !== undefined || filter.priceMax !== undefined)) {
    if (wine.price === null) return false;
    if (filter.priceMin !== undefined && wine.price < filter.priceMin) return false;
    if (filter.priceMax !== undefined && wine.price > filter.priceMax) return false;
  }
  if (except !== "age" && filter.age?.length) {
    const age = ageOf(wine.cellarYears);
    if (!age || !filter.age.includes(age)) return false;
  }
  if (except !== "volume" && filter.volume?.length && !filter.volume.includes(volumeMlOf(wine.volume))) return false;
  return true;
};

const byNullsLast = (a: number | null, b: number | null, direction: 1 | -1) => {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return (a - b) * direction;
};

/** Порядок popular: на полке — как на полке, иначе — общий */
const popularity = (shelf: WineShelf | undefined) => {
  const order = shelf ? shelfById.get(shelf)!.slugs : wineFixtureList.map((wine) => wine.slug);
  return (wine: WineFixture) => order.indexOf(wine.slug);
};

const sorter = (sort: WineSort, shelf: WineShelf | undefined) => {
  const rank = popularity(shelf);
  const byRank = (a: WineFixture, b: WineFixture) => rank(a) - rank(b);
  const by: Record<WineSort, (a: WineFixture, b: WineFixture) => number> = {
    popular: () => 0,
    new: (a, b) => arrivalRankOf(a.slug) - arrivalRankOf(b.slug),
    vintage_asc: (a, b) => byNullsLast(a.vintage, b.vintage, 1),
    price_asc: (a, b) => byNullsLast(a.price, b.price, 1),
    price_desc: (a, b) => byNullsLast(a.price, b.price, -1),
  };
  return (a: WineFixture, b: WineFixture) => by[sort](a, b) || byRank(a, b);
};

const filtered = (filter: WineFilter, sort: WineSort = "popular") =>
  wineFixtureList.filter((wine) => matches(wine, filter)).sort(sorter(sort, filter.shelf));

/** GET /wines */
export const listWines = ({ sort, limit = 12, offset = 0, ...filter }: WineListQuery): Schemas["WinePage"] => {
  const all = filtered(filter, sort);
  return { items: all.slice(offset, offset + limit).map(toWineSummary), total: all.length };
};

const countBy = <T extends string | number>(wines: WineFixture[], values: (wine: WineFixture) => T[]) => {
  const counts = new Map<T, number>();
  for (const wine of wines) for (const value of new Set(values(wine))) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
};

const byCountThenName = <T extends { value: string; count: number }>(a: T, b: T) => b.count - a.count || a.value.localeCompare(b.value, "ru");

/** GET /wines/facets */
export const wineFacets = (filter: WineFilter): Schemas["WineFacets"] => {
  const except = (group: FacetGroup) => wineFixtureList.filter((wine) => matches(wine, filter, group));
  const countries = countBy(except("country"), (wine) => (wine.country && !isPlaceholder(wine.country) ? [wine.country] : []));
  const grapes = countBy(except("grape"), (wine) => wine.grapes.filter((grape) => !isPlaceholder(grape)));
  const ages = countBy(except("age"), (wine) => {
    const age = ageOf(wine.cellarYears);
    return age ? [age] : [];
  });
  const volumes = countBy(except("volume"), (wine) => [volumeMlOf(wine.volume)]);
  const prices = except("price").flatMap((wine) => (wine.price === null ? [] : [wine.price]));
  return {
    total: wineFixtureList.filter((wine) => matches(wine, filter)).length,
    countries: [...countries].map(([value, count]) => ({ value, count })).sort(byCountThenName),
    grapes: [...grapes].map(([value, count]) => ({ value, count })).sort(byCountThenName),
    ages: WINE_AGES.map((value) => ({ value, count: ages.get(value) ?? 0 })),
    volumes: [...volumes].map(([value, count]) => ({ value, count })).sort((a, b) => a.value - b.value),
    price: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
  };
};

/** GET /shelves */
export const listShelves = (filter: Omit<WineFilter, "shelf">, limit = 10): Schemas["Shelf"][] =>
  shelfFixtures.map(({ slugs: _slugs, ...shelf }) => {
    const wines = filtered({ ...filter, shelf: shelf.id });
    return { ...shelf, total: wines.length, wines: wines.slice(0, limit).map(toWineSummary) };
  });

/** Полка вина для крошек — первая, на которой оно стоит */
export const primaryShelfOf = (slug: string): WineShelf =>
  shelfFixtures.find((shelf) => shelf.slugs.includes(slug))?.id ?? "red";

const RELATED_LIMIT = 6;

/** GET /wines/{slug}; null — такого вина нет */
export const wineDetails = (slug: string): WineDetails | null => {
  const wine = wineBySlug.get(slug);
  if (!wine) return null;
  const { relatedSlugs, ...details } = wine;
  const shelf = primaryShelfOf(slug);
  // Выбор сомелье, иначе — соседи по полке
  const related = relatedSlugs.length
    ? relatedSlugs.flatMap((related) => wineBySlug.get(related) ?? [])
    : shelfById.get(shelf)!.slugs.filter((other) => other !== slug).flatMap((other) => wineBySlug.get(other) ?? []);
  return { ...details, shelf, related: related.slice(0, RELATED_LIMIT).map(toWineSummary) };
};

const SUGGEST_WINES = 3;
const SUGGEST_TERMS = 4;

const distinctMatching = (values: string[], q: string) => {
  const needle = normalize(q.trim());
  const seen = new Map<string, string>();
  for (const value of values) {
    if (isPlaceholder(value) || !normalize(value).includes(needle)) continue;
    const key = normalize(value);
    if (!seen.has(key)) seen.set(key, value);
  }
  return [...seen.values()].slice(0, SUGGEST_TERMS);
};

const capitalize = (value: string) => value.charAt(0).toLocaleUpperCase("ru") + value.slice(1);

/**
 * Регионы для подсказки: сначала те, где есть сам запрос («Бург» → Бургундия), затем откуда найденные вина —
 * чаще встречающиеся первыми («пино» → Бургундия, Шампань)
 */
const suggestedRegions = (q: string, found: WineFixture[]) => {
  const byName = distinctMatching(wineFixtureList.flatMap((wine) => [wine.region, ...(wine.country ? [wine.country] : [])]), q);
  const counts = countBy(found, (wine) => (isPlaceholder(wine.region) ? [] : [wine.region]));
  const byWines = [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort(byCountThenName)
    .map(({ value }) => value);
  return [...new Set([...byName, ...byWines])].slice(0, SUGGEST_TERMS);
};

/** GET /search/suggest */
export const searchSuggestions = (q: string): Schemas["SearchSuggestions"] => {
  const found = filtered({ q });
  return {
    wines: found.slice(0, SUGGEST_WINES).map(toWineSummary),
    grapes: distinctMatching(wineFixtureList.flatMap((wine) => wine.grapes), q).map(capitalize),
    regions: suggestedRegions(q, found),
  };
};
