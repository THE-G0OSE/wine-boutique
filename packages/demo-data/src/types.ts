import type { components } from "@wine/contracts/openapi";

/** Схемы публичного API — демо-данные типизированы контрактом */
type Schemas = components["schemas"];

export type WineSummary = Schemas["WineSummary"];
export type WineDetails = Schemas["WineDetails"];
export type WineShelf = Schemas["WineShelf"];
export type BottleShape = Schemas["BottleShape"];
export type Shelf = Schemas["Shelf"];

/** Вино в демо-данных: карточка без вычисляемого (полка по умолчанию, соседи) — их собирают мок и сервис */
export type WineFixture = Omit<WineDetails, "shelf" | "related"> & {
  /** «С этим вином берут» по выбору сомелье; пусто — соседи по полке */
  relatedSlugs: string[];
};

/** Полка магазина: порядок бутылок — как их расставил бутик */
export interface ShelfFixture extends Omit<Shelf, "total" | "wines"> {
  slugs: string[];
}
export type GrapeVariety = Schemas["GrapeVariety"];
export type NewsIssue = Schemas["NewsIssue"];
export type NewsRubric = Schemas["NewsRubric"];
export type NewsArticle = Schemas["NewsArticle"];
export type NewsClipping = Schemas["NewsClipping"];
export type NewsArchiveIssue = Schemas["NewsArchiveIssue"];
export type Review = Schemas["Review"];
export type ReviewTopic = Schemas["ReviewTopic"];
