import { baseApi, type ApiBody, type ApiSchemas } from "@/shared/api";

export const subscribeMonthlyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createMonthlySubscription: build.mutation<ApiSchemas["ServiceRequest"], ApiBody<"createMonthlySubscription">>({
      query: (body) => ({ url: "/monthly/subscriptions", method: "POST", body }),
    }),
  }),
});

export const { useCreateMonthlySubscriptionMutation } = subscribeMonthlyApi;
