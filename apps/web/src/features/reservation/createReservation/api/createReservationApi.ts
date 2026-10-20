import { baseApi, type ApiBody } from "@/shared/api";
import type { Reservation } from "@/entities/reservation";

export const createReservationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createReservation: build.mutation<Reservation, ApiBody<"createReservation">>({
      query: (body) => ({ url: "/reservations", method: "POST", body }),
    }),
  }),
});

export const { useCreateReservationMutation } = createReservationApi;
