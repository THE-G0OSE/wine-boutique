/**
 * Данные из макетов, типизированные контрактом. Фронт отдаёт их моками MSW, сервисы — сидами БД.
 * Плейсхолдеры дизайна ([Имя гостя], [цена]) — не выдумываем, держим как есть.
 */
export type * from "./types.js";
export { wineFixtures, wineFixtureList, shelfFixtures } from "./wines.js";
export {
  ageOf,
  arrivalRankOf,
  listShelves,
  listWines,
  matchesQuery,
  normalize,
  primaryShelfOf,
  searchSuggestions,
  toWineSummary,
  volumeMlOf,
  WINE_AGES,
  wineDetails,
  wineFacets,
  type WineFilter,
  type WineListQuery,
} from "./catalog.js";
export { grapeFixtures } from "./grapes.js";
export { latestIssueFixture } from "./news/latestIssue.js";
export { archiveIssuesFixture, rubricImage } from "./news/archive.js";
export { articleFixtures, moreClippings } from "./news/articles.js";
export { reviewsFixture } from "./reviews.js";
export { boutiqueFixtures } from "./boutiques.js";
export {
  addDays,
  HOLD_DAYS,
  holdUntilOf,
  isSlotAvailable,
  localDate,
  PICKUP_DAYS,
  PICKUP_LEAD_MINUTES,
  pickupDays,
  reservationNumber,
  toZonedIso,
  weekdayOf,
  zonedInstant,
} from "./reservations.js";
