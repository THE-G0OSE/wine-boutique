import { baseApi, type ApiBody, type ApiSchemas } from "@/shared/api";

export const requestGiftsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createGiftRequest: build.mutation<ApiSchemas["ServiceRequest"], ApiBody<"createGiftRequest">>({
      query: (body) => ({ url: "/requests/gift", method: "POST", body }),
    }),
  }),
});

export const { useCreateGiftRequestMutation } = requestGiftsApi;
