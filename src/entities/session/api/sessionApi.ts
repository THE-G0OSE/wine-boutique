import { baseApi, type ApiSchemas } from "@/shared/api";

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSession: build.query<ApiSchemas["Session"], void>({
      query: () => "/auth/session",
      providesTags: ["Session"],
    }),
  }),
});

export const { useGetSessionQuery } = sessionApi;
