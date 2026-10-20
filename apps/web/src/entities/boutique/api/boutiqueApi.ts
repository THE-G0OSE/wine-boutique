import { baseApi } from "@/shared/api";
import type { Boutique, PickupDay } from "../model/types";

export const boutiqueApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBoutiques: build.query<Boutique[], void>({
      query: () => "/boutiques",
    }),
    getBoutiqueSlots: build.query<PickupDay[], string>({
      query: (id) => `/boutiques/${encodeURIComponent(id)}/slots`,
      // Свободное время зависит от текущего момента — не держим его в кэше дольше минуты
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetBoutiquesQuery, useGetBoutiqueSlotsQuery } = boutiqueApi;
