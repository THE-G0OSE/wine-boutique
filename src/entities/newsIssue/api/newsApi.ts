import { baseApi } from "@/shared/api";
import type { NewsIssue } from "../model/types";

export const newsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLatestNewsIssue: build.query<NewsIssue, void>({
      query: () => "/news/issues/latest",
      providesTags: [{ type: "NewsIssue", id: "LATEST" }],
    }),
  }),
});

export const { useGetLatestNewsIssueQuery } = newsApi;
