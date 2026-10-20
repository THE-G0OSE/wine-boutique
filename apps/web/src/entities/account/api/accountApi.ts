import { baseApi, type ApiSchemas } from "@/shared/api";
import type { Loyalty, MyCertificate, MyReservations, MyTasting, Profile } from "../model/types";

/** Данные кабинета: всё под /me — шлюз пускает только вошедших */
export const accountApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<Profile, void>({ query: () => "/me", providesTags: ["Profile"] }),
    getMyReservations: build.query<MyReservations, void>({ query: () => "/me/reservations", providesTags: ["MyReservations"] }),
    getMyTastings: build.query<MyTasting[], void>({ query: () => "/me/tastings", providesTags: ["MyTastings"] }),
    getMyCell: build.query<ApiSchemas["MyCellResponse"], void>({ query: () => "/me/cell", providesTags: ["MyCell"] }),
    getMyMonthly: build.query<ApiSchemas["MyMonthlyResponse"], void>({ query: () => "/me/monthly", providesTags: ["MyMonthly"] }),
    getMyCertificates: build.query<MyCertificate[], void>({ query: () => "/me/certificates", providesTags: ["MyCertificates"] }),
    getMyLoyalty: build.query<Loyalty, void>({ query: () => "/me/loyalty", providesTags: ["Loyalty"] }),
    getMyFavorites: build.query<ApiSchemas["WineSummary"][], void>({ query: () => "/me/favorites", providesTags: ["Favorites"] }),
  }),
});

export const {
  useGetProfileQuery,
  useGetMyReservationsQuery,
  useGetMyTastingsQuery,
  useGetMyCellQuery,
  useGetMyMonthlyQuery,
  useGetMyCertificatesQuery,
  useGetMyLoyaltyQuery,
  useGetMyFavoritesQuery,
} = accountApi;
