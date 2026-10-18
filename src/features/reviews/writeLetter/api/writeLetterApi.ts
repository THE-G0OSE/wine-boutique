import { baseApi, type ApiBody } from "@/shared/api";

export const writeLetterApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendReview: build.mutation<void, ApiBody<"sendReview">>({
      query: (body) => ({ url: "/reviews", method: "POST", body }),
    }),
  }),
});

export const { useSendReviewMutation } = writeLetterApi;
