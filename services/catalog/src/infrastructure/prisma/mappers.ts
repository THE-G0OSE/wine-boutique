import type { Wine, WineCard } from "../../domain/wine.js";
import type { Wine as WineRow } from "./generated/client.js";

export const toWine = (row: WineRow): Wine => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  categories: row.categories,
  region: row.region,
  country: row.country,
  grapes: row.grapes,
  volumeMl: row.volumeMl,
  vintage: row.vintage,
  cellaredAt: row.cellaredAt,
  priceKopecks: row.priceKopecks,
  imageUrl: row.imageUrl,
  bottle: row.bottle,
});

/** JSON-колонки карточки пишет только сид и (потом) админка по схеме контракта — читаем их как есть */
export const toWineCard = (row: WineRow): WineCard => ({
  ...toWine(row),
  producer: row.producer,
  appellation: row.appellation,
  abv: row.abv,
  aging: row.aging,
  potential: row.potential,
  badges: row.badges,
  profile: row.profile as WineCard["profile"],
  notes: row.notes as WineCard["notes"],
  food: row.food as WineCard["food"],
  serve: row.serve as WineCard["serve"],
  sommelierNote: row.sommelierNote,
});
