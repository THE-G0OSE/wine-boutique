import { baseApi, type ApiQuery } from "@/shared/api";
import type { SearchSuggestions, Shelf, WineDetails, WineFacets, WinePage } from "../model/types";

/** Мобильная полка: «Показать ещё» добавляет по 12 бутылок (MCategory) */
export const WINES_MOBILE_PAGE_SIZE = 12;

type WineListArgs = Omit<ApiQuery<"getWines">, "limit" | "offset">;

export const wineApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getShelves: build.query<Shelf[], ApiQuery<"getShelves"> | void>({
      query: (params) => ({ url: "/shelves", params: params ?? undefined }),
      providesTags: [{ type: "Shelf", id: "LIST" }],
    }),
    getWines: build.query<WinePage, ApiQuery<"getWines"> | void>({
      query: (params) => ({ url: "/wines", params: params ?? undefined }),
      providesTags: (result) => [
        { type: "Wine" as const, id: "LIST" },
        ...(result?.items.map(({ id }) => ({ type: "Wine" as const, id })) ?? []),
      ],
    }),
    // Мобильная полка: следующая страница по offset, пока не кончатся
    getShelfWines: build.infiniteQuery<WinePage, WineListArgs, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastOffset) => {
          const next = lastOffset + lastPage.items.length;
          return lastPage.items.length > 0 && next < lastPage.total ? next : undefined;
        },
      },
      query: ({ queryArg, pageParam }) => ({ url: "/wines", params: { ...queryArg, limit: WINES_MOBILE_PAGE_SIZE, offset: pageParam } }),
    }),
    getWineFacets: build.query<WineFacets, ApiQuery<"getWineFacets"> | void>({
      query: (params) => ({ url: "/wines/facets", params: params ?? undefined }),
    }),
    getWine: build.query<WineDetails, string>({
      query: (slug) => `/wines/${encodeURIComponent(slug)}`,
      providesTags: (result) => (result ? [{ type: "Wine" as const, id: result.id }] : []),
    }),
    getSearchSuggestions: build.query<SearchSuggestions, string>({
      query: (q) => ({ url: "/search/suggest", params: { q } }),
    }),
  }),
});

export const {
  useGetShelvesQuery,
  useGetWinesQuery,
  useGetShelfWinesInfiniteQuery,
  useGetWineFacetsQuery,
  useGetWineQuery,
  useGetSearchSuggestionsQuery,
} = wineApi;
