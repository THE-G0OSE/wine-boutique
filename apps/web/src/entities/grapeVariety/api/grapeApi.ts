import { baseApi } from "@/shared/api";
import type { GrapeVariety } from "../model/types";

export const grapeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getGrapes: build.query<GrapeVariety[], void>({
      query: () => "/grapes",
      providesTags: [{ type: "Grape", id: "LIST" }],
    }),
  }),
});

export const { useGetGrapesQuery } = grapeApi;
