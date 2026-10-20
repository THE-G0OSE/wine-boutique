import { baseApi } from "@/shared/api";
import type { MonthlyCrates } from "../model/types";

export const monthlyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Текущий ящик и архив: меняются раз в месяц */
    getMonthlyCrates: build.query<MonthlyCrates, void>({
      query: () => "/monthly",
    }),
  }),
});

export const { useGetMonthlyCratesQuery } = monthlyApi;
