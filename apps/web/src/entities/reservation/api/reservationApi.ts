import { baseApi } from "@/shared/api";
import type { Reservation } from "../model/types";

export const reservationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReservation: build.query<Reservation, string>({
      query: (id) => `/reservations/${encodeURIComponent(id)}`,
    }),
  }),
});

export const { useGetReservationQuery } = reservationApi;
