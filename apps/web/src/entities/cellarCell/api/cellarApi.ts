import { baseApi } from "@/shared/api";
import type { CellarCell } from "../model/types";

export const cellarApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Стена погреба: занятость меняется с договорами — в кэше недолго */
    getCellarCells: build.query<CellarCell[], void>({
      query: () => "/cellar/cells",
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetCellarCellsQuery } = cellarApi;
