import type { ApiQuery, ApiSchemas } from "@/shared/api";

export type WineSummary = ApiSchemas["WineSummary"];
export type WineDetails = ApiSchemas["WineDetails"];
export type WineCategory = ApiSchemas["WineCategory"];
export type WineShelf = ApiSchemas["WineShelf"];
export type WineAge = ApiSchemas["WineAge"];
export type BottleShape = ApiSchemas["BottleShape"];
export type WineSort = ApiSchemas["WineSort"];
export type WinePage = ApiSchemas["WinePage"];
export type Shelf = ApiSchemas["Shelf"];
export type WineFacets = ApiSchemas["WineFacets"];
export type TasteProfile = ApiSchemas["TasteProfile"];
export type SearchSuggestions = ApiSchemas["SearchSuggestions"];

/** Фильтры каталога — общие для /wines, /wines/facets и /shelves */
export type WineFilter = Omit<ApiQuery<"getWineFacets">, "shelf">;
