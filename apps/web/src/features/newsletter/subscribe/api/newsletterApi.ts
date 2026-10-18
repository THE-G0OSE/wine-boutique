import { baseApi, type ApiBody } from "@/shared/api";

export const newsletterApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    subscribeNewsletter: build.mutation<void, ApiBody<"subscribeNewsletter">>({
      query: (body) => ({ url: "/newsletter", method: "POST", body }),
    }),
  }),
});

export const { useSubscribeNewsletterMutation } = newsletterApi;
