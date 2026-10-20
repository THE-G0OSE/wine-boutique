import { delay } from "msw";
import { mockHttp, withAssetBase } from "@/shared/api/mockHttp";
import type { WineAge, WineCategory, WineShelf, WineSort } from "../model/types";
import { listShelves, listWines, searchSuggestions, wineDetails, wineFacets, type WineFilter } from "@wine/demo-data";

/** Ответы — эталон каталога из @wine/demo-data: те же правила, что у сервиса catalog */

const numberOrUndefined = (value: string | null) => (value === null || value === "" ? undefined : Number(value));

const filterFrom = (query: URLSearchParams): WineFilter => ({
  shelf: (query.get("shelf") as WineShelf | null) ?? undefined,
  category: (query.get("category") as WineCategory | null) ?? undefined,
  q: query.get("q") ?? undefined,
  country: query.getAll("country"),
  grape: query.getAll("grape"),
  priceMin: numberOrUndefined(query.get("priceMin")),
  priceMax: numberOrUndefined(query.get("priceMax")),
  age: query.getAll("age") as WineAge[],
  volume: query.getAll("volume").map(Number),
});

/** openapi-msw отдаёт query как обёртку над URLSearchParams — берём исходную строку запроса */
const searchOf = (request: Request) => new URL(request.url).searchParams;

export const wineHandlers = [
  mockHttp.get("/shelves", async ({ request, response }) => {
    await delay();
    const query = searchOf(request);
    // Полки сами по себе — фильтр shelf к ним не применяется
    const filter = { ...filterFrom(query), shelf: undefined };
    return response(200).json(withAssetBase(listShelves(filter, numberOrUndefined(query.get("limit")) ?? 10)));
  }),

  mockHttp.get("/wines", async ({ request, response }) => {
    await delay();
    const query = searchOf(request);
    return response(200).json(
      withAssetBase(
        listWines({
          ...filterFrom(query),
          sort: (query.get("sort") as WineSort | null) ?? "popular",
          limit: numberOrUndefined(query.get("limit")) ?? 12,
          offset: numberOrUndefined(query.get("offset")) ?? 0,
        })
      )
    );
  }),

  mockHttp.get("/wines/facets", async ({ request, response }) => {
    await delay();
    return response(200).json(wineFacets(filterFrom(searchOf(request))));
  }),

  mockHttp.get("/wines/{slug}", async ({ params, response }) => {
    await delay();
    const wine = wineDetails(params.slug);
    if (!wine) return response(404).json({ code: "not_found", message: "Такого вина на полках нет" });
    return response(200).json(withAssetBase(wine));
  }),

  mockHttp.get("/search/suggest", async ({ request, response }) => {
    await delay(150);
    return response(200).json(withAssetBase(searchSuggestions(searchOf(request).get("q") ?? "")));
  }),
];
