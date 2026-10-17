import { baseApi, type ApiQuery } from "@/shared/api";
import type { NewsArchive, NewsIssue } from "../model/types";

export const newsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLatestNewsIssue: build.query<NewsIssue, void>({
      query: () => "/news/issues/latest",
      providesTags: [{ type: "NewsIssue", id: "LATEST" }],
    }),
    getNewsArchive: build.query<NewsArchive, ApiQuery<"getNewsArchive"> | void>({
      query: (params) => ({ url: "/news/archive", params: params ?? undefined }),
      providesTags: [{ type: "NewsIssue", id: "ARCHIVE" }],
    }),
  }),
});

export const { useGetLatestNewsIssueQuery, useGetNewsArchiveQuery } = newsApi;
