import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { WINE_SORT_OPTIONS } from "../catalog";
import type { WineAge, WineFilter, WineSort } from "../../types";

/** Группы фильтров с множественным выбором — как параметры контракта */
export type FilterGroup = "country" | "grape" | "age" | "volume";

const AGES: WineAge[] = ["up_to_3", "from_3_to_10", "from_10_to_20", "over_20"];
const SORTS = WINE_SORT_OPTIONS.map(({ value }) => value);

const intOrUndefined = (value: string | null) => {
  if (value === null || value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : undefined;
};

/**
 * Фильтры, сортировка, поиск и страница каталога — в URL (?country=Италия&grape=неббиоло&sort=price_asc&page=2):
 * ссылкой можно поделиться, F5 и «назад» их сохраняют. Любая смена фильтра возвращает на первую страницу.
 */
export const useCatalogParams = () => {
  const [params, setParams] = useSearchParams();

  const filter = useMemo<WineFilter>(() => {
    const ages = params.getAll("age").filter((age): age is WineAge => AGES.includes(age as WineAge));
    const volumes = params.getAll("volume").map(intOrUndefined).filter((ml): ml is number => ml !== undefined);
    const q = params.get("q")?.trim();
    return {
      q: q || undefined,
      country: params.getAll("country"),
      grape: params.getAll("grape"),
      priceMin: intOrUndefined(params.get("priceMin")),
      priceMax: intOrUndefined(params.get("priceMax")),
      age: ages,
      volume: volumes,
    };
  }, [params]);

  const rawSort = params.get("sort");
  const sort: WineSort = SORTS.includes(rawSort as WineSort) ? (rawSort as WineSort) : "popular";
  const page = Math.max(1, intOrUndefined(params.get("page")) ?? 1);

  const update = useCallback(
    (change: (next: URLSearchParams) => void, { resetPage = true } = {}) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          change(next);
          if (resetPage) next.delete("page");
          return next;
        },
        { replace: true, preventScrollReset: true }
      ),
    [setParams]
  );

  const toggle = useCallback(
    (group: FilterGroup, value: string) =>
      update((next) => {
        const values = next.getAll(group);
        next.delete(group);
        const updated = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
        for (const item of updated) next.append(group, item);
      }),
    [update]
  );

  const setPrice = useCallback(
    (min: number | undefined, max: number | undefined) =>
      update((next) => {
        for (const [key, value] of [["priceMin", min], ["priceMax", max]] as const) {
          if (value === undefined) next.delete(key);
          else next.set(key, String(value));
        }
      }),
    [update]
  );

  const clear = useCallback(
    (group: FilterGroup | "price") =>
      update((next) => {
        if (group === "price") {
          next.delete("priceMin");
          next.delete("priceMax");
        } else next.delete(group);
      }),
    [update]
  );

  /** Сбросить все фильтры; поиск и сортировка остаются */
  const clearAll = useCallback(
    () =>
      update((next) => {
        for (const key of ["country", "grape", "age", "volume", "priceMin", "priceMax"]) next.delete(key);
      }),
    [update]
  );

  const setSort = useCallback(
    (value: WineSort) =>
      update((next) => {
        if (value === "popular") next.delete("sort");
        else next.set("sort", value);
      }),
    [update]
  );

  const setPage = useCallback(
    (value: number) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value <= 1) next.delete("page");
          else next.set("page", String(value));
          return next;
        },
        // Новая страница — запись в истории, «назад» вернёт на прежнюю
        { preventScrollReset: true }
      ),
    [setParams]
  );

  const activeCount =
    (filter.country?.length ?? 0) +
    (filter.grape?.length ?? 0) +
    (filter.age?.length ?? 0) +
    (filter.volume?.length ?? 0) +
    (filter.priceMin !== undefined || filter.priceMax !== undefined ? 1 : 0);

  /** Строка фильтров для ссылок на другие полки: выбранное сохраняется, страница — нет */
  const filterSearch = useMemo(() => {
    const next = new URLSearchParams(params);
    next.delete("page");
    next.delete("q");
    const search = next.toString();
    return search ? `?${search}` : "";
  }, [params]);

  return { filter, sort, page, activeCount, filterSearch, toggle, setPrice, clear, clearAll, setSort, setPage };
};

export type CatalogParams = ReturnType<typeof useCatalogParams>;
