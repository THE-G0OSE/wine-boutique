import { baseApi } from "@/shared/api";
import type { ReviewPage } from "../model/types";

/** Сколько писем достаём из ящика за раз */
export const REVIEWS_PAGE_SIZE = 5;

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // «Показать ещё письма» — следующая страница по offset, пока не кончатся
    getReviews: build.infiniteQuery<ReviewPage, void, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastOffset) => {
          const next = lastOffset + lastPage.items.length;
          return lastPage.items.length > 0 && next < lastPage.total ? next : undefined;
        },
      },
      query: ({ pageParam }) => ({ url: "/reviews", params: { limit: REVIEWS_PAGE_SIZE, offset: pageParam } }),
    }),
  }),
});

export const { useGetReviewsInfiniteQuery } = reviewsApi;
