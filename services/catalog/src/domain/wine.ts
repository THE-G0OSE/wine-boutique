export type WineCategory = "red" | "white" | "sparkling" | "sweet";

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
