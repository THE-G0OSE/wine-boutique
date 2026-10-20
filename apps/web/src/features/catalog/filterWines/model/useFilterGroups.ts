import {
  formatVolume,
  useGetWineFacetsQuery,
  WINE_AGE_LABELS,
  type CatalogParams,
  type FilterGroup,
  type WineShelf,
} from "@/entities/wine";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  checked: boolean;
}

export interface FilterGroupView {
  id: FilterGroup;
  label: string;
  options: FilterOption[];
}

export const PRICE_LABEL = "Цена";

/**
 * Группы фильтров со счётчиками для текущей полки и поиска (GET /wines/facets).
 * Порядок — как в макете: Страна, Сорт, (Цена), Выдержка, Объём.
 */
export const useFilterGroups = ({ filter }: CatalogParams, shelf?: WineShelf) => {
  const { data, isFetching } = useGetWineFacetsQuery({ shelf, ...filter });

  const selected = (group: FilterGroup) => (filter[group] ?? []).map(String);
  const group = (id: FilterGroup, label: string, options: { value: string | number; count: number }[], labelOf = (value: string) => value): FilterGroupView => {
    const picked = selected(id);
    // Выбранный вариант остаётся в списке, даже если под новые фильтры его вин не осталось
    const values = new Map(options.map(({ value, count }) => [String(value), count]));
    for (const value of picked) if (!values.has(value)) values.set(value, 0);
    return {
      id,
      label,
      options: [...values].map(([value, count]) => ({ value, label: labelOf(value), count, checked: picked.includes(value) })),
    };
  };

  // Пока счётчики грузятся, чипы уже на месте — ряд не прыгает
  const groups: FilterGroupView[] = [
    group("country", "Страна", data?.countries ?? []),
    group("grape", "Сорт", data?.grapes ?? [], (value) => value.charAt(0).toLocaleUpperCase("ru") + value.slice(1)),
    group("age", "Выдержка", data?.ages ?? [], (value) => WINE_AGE_LABELS[value as keyof typeof WINE_AGE_LABELS] ?? value),
    group("volume", "Объём", data?.volumes ?? [], (value) => formatVolume(Number(value))),
  ];

  return { groups, total: data?.total, price: data?.price ?? null, isFetching };
};
