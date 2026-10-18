import type { WineCategory } from "@/entities/wine";

/** Слои погреба: год урожая и что лежит на этой глубине (артборд Cellar) */
export const CELLAR_YEARS = [
  { year: "2026", caption: "урожай этого года", isCurrent: true },
  { year: "2015", caption: "Sassicaia · 11 лет в погребе", isCurrent: false },
  { year: "2008", caption: "Cristal · 18 лет в погребе", isCurrent: false },
  { year: "1988", caption: "Château d’Yquem · 38 лет в погребе", isCurrent: false },
] as const;

/** Подписи глубины слева: [текст, отступ сверху в макете] */
export const DEPTH_LABELS: [string, number][] = [
  ["поверхность", 190],
  ["корни", 860],
  ["погреб", 1440],
];

export const CELLAR_STATS = [
  { value: "38 лет", caption: "выдержка Château d’Yquem 1988" },
  { value: "[N]", caption: "бутылок ждут своего часа" },
] as const;

export type CellarTab = "all" | WineCategory;

export const CELLAR_TABS: { id: CellarTab; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "red", label: "Красные" },
  { id: "white", label: "Белые" },
  { id: "sparkling", label: "Игристые" },
  { id: "sweet", label: "Сладкие" },
];

/** Сколько бутылок показываем в каталоге погреба на главной */
export const CELLAR_CATALOG_LIMIT = 4;
