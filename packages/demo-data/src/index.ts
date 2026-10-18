/**
 * Данные из макетов, типизированные контрактом. Фронт отдаёт их моками MSW, сервисы — сидами БД.
 * Плейсхолдеры дизайна ([Имя гостя], [цена]) — не выдумываем, держим как есть.
 */
export type * from "./types";
export { wineFixtures, wineFixtureList } from "./wines";
export { grapeFixtures } from "./grapes";
export { latestIssueFixture } from "./news/latestIssue";
export { archiveIssuesFixture, rubricImage } from "./news/archive";
export { articleFixtures, moreClippings } from "./news/articles";
export { reviewsFixture } from "./reviews";
