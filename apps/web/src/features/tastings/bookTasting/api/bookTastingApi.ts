import { baseApi, type ApiBody } from "@/shared/api";
import type { TastingBooking } from "@/entities/tasting";

type Body = ApiBody<"createTastingBooking">;

/** Месяц афиши, где стоит дегустация: «2026-10-17-1900» → «2026-10» — его места пересчитываются */
const monthOf = (id: string) => id.slice(0, 7);

export const bookTastingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTastingBooking: build.mutation<TastingBooking, { id: string; body: Body }>({
      query: ({ id, body }) => ({ url: `/tastings/${encodeURIComponent(id)}/bookings`, method: "POST", body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Tasting", id: monthOf(id) }],
    }),
    joinTastingWaitlist: build.mutation<void, { id: string; body: Body }>({
      query: ({ id, body }) => ({ url: `/tastings/${encodeURIComponent(id)}/waitlist`, method: "POST", body }),
      // 409 seats_available — место освободилось: афиша обновится и покажет «Записаться»
      invalidatesTags: (_result, error, { id }) => (error ? [{ type: "Tasting", id: monthOf(id) }] : []),
    }),
  }),
});

export const { useCreateTastingBookingMutation, useJoinTastingWaitlistMutation } = bookTastingApi;
