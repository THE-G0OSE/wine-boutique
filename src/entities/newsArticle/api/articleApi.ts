import { baseApi } from "@/shared/api";
import type { NewsArticle } from "../model/types";

export const articleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNewsArticle: build.query<NewsArticle, string>({
      query: (slug) => `/news/articles/${encodeURIComponent(slug)}`,
      providesTags: (_result, _error, slug) => [{ type: "NewsArticle", id: slug }],
    }),
  }),
});

export const { useGetNewsArticleQuery } = articleApi;
