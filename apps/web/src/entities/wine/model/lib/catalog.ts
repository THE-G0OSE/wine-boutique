import type { BottleShape, WineAge, WineShelf, WineSort } from "../types";

/** Высота бутылки на полке — по силуэту, как в макетах Shop (десктоп) и MShop (мобильные) */
export const BOTTLE_HEIGHT_CLASS: Record<BottleShape, { lg: string; sm: string }> = {
  red: { lg: "h-75", sm: "h-52.5" },
  white: { lg: "h-75", sm: "h-52.5" },
  sweet: { lg: "h-73", sm: "h-51.25" },
  sparkling: { lg: "h-76", sm: "h-53" },
  burgundy: { lg: "h-75", sm: "h-52.5" },
  flute: { lg: "h-80.5", sm: "h-56.25" },
  black: { lg: "h-75.5", sm: "h-53" },
  prosecco: { lg: "h-75", sm: "h-52.5" },
  port: { lg: "h-72", sm: "h-50.5" },
  tokaji: { lg: "h-59", sm: "h-41.5" },
};

export const WINE_SHELVES: WineShelf[] = ["red", "white", "sparkling", "aged"];

/** Короткие подписи полок для табов на мобильных (MCategory); на десктопе — названия полок из API */
export const SHELF_SHORT_LABELS: Record<WineShelf, string> = {
  red: "Красные",
  white: "Белые",
  sparkling: "Игристые",
  aged: "10+ лет",
};

export const isWineShelf = (value: string | null | undefined): value is WineShelf =>
  WINE_SHELVES.includes(value as WineShelf);

export const WINE_AGE_LABELS: Record<WineAge, string> = {
  up_to_3: "до 3 лет",
  from_3_to_10: "3–10 лет",
  from_10_to_20: "10–20 лет",
  over_20: "20+ лет",
};

/** Сортировки в порядке выпадающего списка (макет SortOpen) */
export const WINE_SORT_OPTIONS: { value: WineSort; label: string }[] = [
  { value: "popular", label: "популярные" },
  { value: "price_asc", label: "сначала дешевле" },
  { value: "price_desc", label: "сначала дороже" },
  { value: "vintage_asc", label: "старше урожай" },
  { value: "new", label: "новинки" },
];

const liters = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 });

/** 750 → «0,75 л», 1500 → «1,5 л магнум» */
export const formatVolume = (ml: number) => `${liters.format(ml / 1000)} л${ml === 1500 ? " магнум" : ""}`;
