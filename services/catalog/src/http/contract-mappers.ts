import type { components } from "@wine/contracts/openapi";
import type { GrapeVariety } from "../domain/grape-variety.js";
import type { WineCardView } from "../application/ports.js";
import type { WineFilter } from "../domain/catalog-filter.js";
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
  bottle: wine.bottle,
});

/** Карточка вина в формате контракта */
export const toWineDetails = ({ card, shelf, related }: WineCardView, today: Date): Schemas["WineDetails"] => ({
  ...toWineSummary(card, today),
  shelf,
  producer: card.producer,
  appellation: card.appellation,
  abv: card.abv,
  aging: card.aging,
  potential: card.potential,
  badges: card.badges,
  profile: card.profile,
  notes: card.notes,
  food: card.food,
  serve: card.serve,
  sommelierNote: card.sommelierNote,
  related: related.map((wine) => toWineSummary(wine, today)),
});

/** Параметры фильтра из строки запроса (схема контракта) → фильтр домена: объём в API — `volume` в мл */
export const toWineFilter = (query: {
  shelf?: WineFilter["shelf"];
  category?: WineFilter["category"];
  q?: string;
  country?: string[];
  grape?: string[];
  priceMin?: number;
  priceMax?: number;
  age?: WineFilter["age"];
  volume?: number[];
}): WineFilter => ({
  shelf: query.shelf,
  category: query.category,
  q: query.q?.trim() || undefined,
  country: query.country,
  grape: query.grape,
  priceMin: query.priceMin,
  priceMax: query.priceMax,
  age: query.age,
  volumeMl: query.volume,
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
