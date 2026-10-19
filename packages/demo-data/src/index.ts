/**
 * Данные из макетов, типизированные контрактом. Фронт отдаёт их моками MSW, сервисы — сидами БД.
 * Плейсхолдеры дизайна ([Имя гостя], [цена]) — не выдумываем, держим как есть.
 */
export type * from "./types.js";
export { wineFixtures, wineFixtureList } from "./wines.js";
export { grapeFixtures } from "./grapes.js";
export { latestIssueFixture } from "./news/latestIssue.js";
export { archiveIssuesFixture, rubricImage } from "./news/archive.js";
export { articleFixtures, moreClippings } from "./news/articles.js";
export { reviewsFixture } from "./reviews.js";
