import type { components } from "@wine/contracts/openapi";

/** Схемы публичного API — демо-данные типизированы контрактом */
type Schemas = components["schemas"];

export type WineSummary = Schemas["WineSummary"];
export type GrapeVariety = Schemas["GrapeVariety"];
export type NewsIssue = Schemas["NewsIssue"];
export type NewsRubric = Schemas["NewsRubric"];
export type NewsArticle = Schemas["NewsArticle"];
export type NewsClipping = Schemas["NewsClipping"];
export type NewsArchiveIssue = Schemas["NewsArchiveIssue"];
export type Review = Schemas["Review"];
export type ReviewTopic = Schemas["ReviewTopic"];
