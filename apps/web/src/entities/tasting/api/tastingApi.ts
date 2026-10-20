import { baseApi } from "@/shared/api";
import type { Tasting } from "../model/types";

export const tastingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Афиша месяца «2026-10»: места меняются с каждой записью — в кэше недолго */
    getTastings: build.query<Tasting[], string>({
      query: (month) => ({ url: "/tastings", params: { month } }),
      providesTags: (_result, _error, month) => [{ type: "Tasting", id: month }],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetTastingsQuery } = tastingApi;
