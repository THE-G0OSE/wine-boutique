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
export {
  addMonths,
  daysInMonth,
  findTastingFixture,
  listTastings,
  TASTING_CAPACITY,
  TASTING_DESCRIPTIONS,
  TASTING_MAX_GUESTS,
  TASTING_MONTHS,
  TASTING_TIMEZONE,
  tastingFixtures,
  tastingId,
  tastingMonths,
  tastingSchedule,
  tastingStatus,
  toTasting,
  type TastingFixture,
} from "./tastings.js";
export { CELLAR_CAPACITY, CELLAR_COLUMNS, CELLAR_ROWS, cellarCellFixtures } from "./cellar.js";
export {
  certificateSerial,
  certificateValidUntil,
  HALL_BOOKING_DAYS,
  HALL_CAPACITY,
  isHallDateAllowed,
  MONTHLY_ARCHIVE_SIZE,
  monthlyCrateFixtures,
  monthlyCrates,
  requestNumber,
} from "./requests.js";
export {
  DEMO_GUEST,
  demoCell,
  demoCertificates,
  demoFavorites,
  demoLoyalty,
  demoMonthly,
  demoProfile,
  demoReservations,
  demoTastings,
  LOYALTY_LEVELS,
  WELCOME_BONUS,
} from "./account.js";
