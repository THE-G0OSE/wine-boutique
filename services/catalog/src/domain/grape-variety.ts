import type { Wine } from "./wine.js";

export type GrapeType = "red" | "white";

export interface GrapeVariety {
  id: string;
  slug: string;
  name: string;
  type: GrapeType;
  origin: string;
  taste: string;
  harvest: string;
  description: string;
  plantation: string | null;
  imageUrl: string;
  /** Вина из этого сорта по порядку — не больше трёх */
  wines: Wine[];
}

export const MAX_WINES_PER_VARIETY = 3;
