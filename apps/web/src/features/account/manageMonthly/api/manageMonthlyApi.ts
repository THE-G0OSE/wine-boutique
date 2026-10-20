import { baseApi, type ApiBody, type ApiSchemas } from "@/shared/api";

export const manageMonthlyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateMyMonthly: build.mutation<ApiSchemas["MyMonthlyResponse"], ApiBody<"updateMyMonthly">>({
      query: (body) => ({ url: "/me/monthly", method: "PATCH", body }),
      invalidatesTags: ["MyMonthly"],
    }),
  }),
});

/** Пауза подписки на набор месяца или пропуск следующего месяца */
export const { useUpdateMyMonthlyMutation } = manageMonthlyApi;
