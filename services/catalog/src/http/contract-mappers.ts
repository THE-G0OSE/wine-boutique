import type { components } from "@wine/contracts/openapi";
import type { GrapeVariety } from "../domain/grape-variety.js";
import { cellarYears, type Wine } from "../domain/wine.js";

type Schemas = components["schemas"];

const volume = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 });

/** Вино в формате контракта: объём «0,75 л», цена в рублях, лет в погребе на сегодня */
export const toWineSummary = (wine: Wine, today: Date): Schemas["WineSummary"] => ({
  id: wine.id,
  slug: wine.slug,
  name: wine.name,
  categories: wine.categories,
  region: wine.region,
  country: wine.country,
  grapes: wine.grapes,
  volume: `${volume.format(wine.volumeMl / 1000)} л`,
  vintage: wine.vintage,
  cellarYears: cellarYears(wine.cellaredAt, today),
  price: wine.priceKopecks === null ? null : Math.round(wine.priceKopecks / 100),
  image: wine.imageUrl,
});

export const toGrapeVarietyContract = (variety: GrapeVariety, today: Date): Schemas["GrapeVariety"] => ({
  id: variety.id,
  slug: variety.slug,
  name: variety.name,
  type: variety.type,
  origin: variety.origin,
  taste: variety.taste,
  harvest: variety.harvest,
  description: variety.description,
  plantation: variety.plantation,
  image: variety.imageUrl,
  wines: variety.wines.map((wine) => toWineSummary(wine, today)),
});
