import { baseApi, type ApiQuery } from "@/shared/api";
import type { WinePage } from "../model/types";

export const wineApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWines: build.query<WinePage, ApiQuery<"getWines"> | void>({
      query: (params) => ({ url: "/wines", params: params ?? undefined }),
      providesTags: (result) => [
        { type: "Wine" as const, id: "LIST" },
        ...(result?.items.map(({ id }) => ({ type: "Wine" as const, id })) ?? []),
      ],
    }),
  }),
});

export const { useGetWinesQuery } = wineApi;
