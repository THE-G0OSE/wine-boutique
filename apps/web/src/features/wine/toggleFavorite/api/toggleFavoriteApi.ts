import { baseApi } from "@/shared/api";

export const toggleFavoriteApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addFavorite: build.mutation<void, string>({
      query: (wineId) => ({ url: `/me/favorites/${encodeURIComponent(wineId)}`, method: "PUT" }),
      invalidatesTags: ["Favorites"],
    }),
    removeFavorite: build.mutation<void, string>({
      query: (wineId) => ({ url: `/me/favorites/${encodeURIComponent(wineId)}`, method: "DELETE" }),
      invalidatesTags: ["Favorites"],
    }),
  }),
});

export const { useAddFavoriteMutation, useRemoveFavoriteMutation } = toggleFavoriteApi;
