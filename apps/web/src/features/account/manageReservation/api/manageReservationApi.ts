import { baseApi, type ApiSchemas } from "@/shared/api";

export const manageReservationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    extendMyReservation: build.mutation<ApiSchemas["Reservation"], string>({
      query: (id) => ({ url: `/me/reservations/${encodeURIComponent(id)}/extend`, method: "POST" }),
      invalidatesTags: ["MyReservations"],
    }),
    cancelMyReservation: build.mutation<ApiSchemas["Reservation"], string>({
      query: (id) => ({ url: `/me/reservations/${encodeURIComponent(id)}/cancel`, method: "POST" }),
      invalidatesTags: ["MyReservations"],
    }),
  }),
});

/** Продлить бронь на 3 дня (один раз) или отменить — бутылки вернутся на полку */
export const { useExtendMyReservationMutation, useCancelMyReservationMutation } = manageReservationApi;
