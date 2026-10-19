import type { Wine } from "../../domain/wine.js";
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
});
