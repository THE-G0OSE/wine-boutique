export type WineCategory = "red" | "white" | "sparkling" | "sweet";

/** Полки магазина: red — красные, white — белые, sparkling — игристые и сладкие, aged — коллекция 10+ лет */
export type WineShelf = "red" | "white" | "sparkling" | "aged";

export type BottleShape = "red" | "white" | "sweet" | "sparkling" | "burgundy" | "flute" | "black" | "prosecco" | "port" | "tokaji";

/** popular — популярные, price_* — по цене, vintage_asc — сначала старше урожай, new — новинки */
export type WineSort = "popular" | "price_asc" | "price_desc" | "vintage_asc" | "new";

export interface Wine {
  id: string;
  slug: string;
  name: string;
  categories: WineCategory[];
  region: string;
  country: string | null;
  grapes: string[];
  volumeMl: number;
  vintage: number | null;
  /** С какого дня бутылка в погребе бутика */
  cellaredAt: Date | null;
  /** Цена в копейках; null — ещё не назначена */
  priceKopecks: number | null;
  imageUrl: string;
  bottle: BottleShape;
}

export interface TasteScale {
  level: number;
  word: string;
}

export interface TasteProfile {
  body: TasteScale;
  tannins: TasteScale;
  acidity: TasteScale;
  sweetness: TasteScale;
}

/** Карточка вина: паспорт, вкус и подача — тексты как на этикетке */
export interface WineCard extends Wine {
  producer: string | null;
  appellation: string | null;
  abv: string;
  aging: string;
  potential: string;
  badges: string[];
  profile: TasteProfile | null;
  notes: { aroma: string; taste: string; finish: string };
  food: { icon: string; text: string }[];
  serve: { temperature: string; decanting: string; glass: string } | null;
  sommelierNote: string;
}

/** Сколько полных лет бутылка лежит в погребе бутика */
export const cellarYears = (cellaredAt: Date | null, today: Date): number | null => {
  if (cellaredAt === null) return null;
  let years = today.getUTCFullYear() - cellaredAt.getUTCFullYear();
  const anniversaryPassed =
    today.getUTCMonth() > cellaredAt.getUTCMonth() ||
    (today.getUTCMonth() === cellaredAt.getUTCMonth() && today.getUTCDate() >= cellaredAt.getUTCDate());
  if (!anniversaryPassed) years -= 1;
  return Math.max(0, years);
};

/** Текст для поиска: регистр и «ё» не важны (как в эталоне каталога @wine/demo-data) */
export const normalizeSearch = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");

/** Что ищется по запросу: название, сорта, регион, страна, винодельня, апелласьон */
export const searchTextOf = (wine: Pick<WineCard, "name" | "region" | "country" | "grapes" | "producer" | "appellation">) =>
  normalizeSearch([wine.name, wine.region, wine.country ?? "", ...wine.grapes, wine.producer ?? "", wine.appellation ?? ""].join(" "));

/** Слова запроса — каждое должно найтись в тексте вина */
export const searchWords = (q: string) => normalizeSearch(q).split(/\s+/).filter(Boolean);

/** Плейсхолдеры дизайна («[сорт]», «[регион]») в фильтрах и подсказках не показываем */
export const isPlaceholder = (value: string) => value.startsWith("[");
