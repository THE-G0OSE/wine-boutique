import { delay } from "msw";
import { mockAccount } from "@/entities/account/mocks";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp } from "@/shared/api/mockHttp";

const UNAUTHORIZED = { code: "unauthorized", message: "Войдите, чтобы продолжить" };
const DAY = 24 * 60 * 60 * 1000;

/** «2026-10-22T22:00:00+03:00» + 3 дня — смещение пояса сохраняется */
const plusDays = (iso: string, days: number) => {
  const shifted = new Date(new Date(iso).getTime() + days * DAY);
  const offset = iso.slice(19);
  const local = new Date(shifted.getTime() + Number(offset.slice(0, 3)) * 60 * 60 * 1000);
  return `${local.toISOString().slice(0, 19)}${offset}`;
};

/** Продление и отмена брони — по правилам сервиса reservations: продлить можно один раз на 3 дня, только активную */
export const manageReservationHandlers = [
  mockHttp.post("/me/reservations/{id}/extend", async ({ params, response }) => {
    await delay(500);
    const user = mockSession.user();
    if (!user) return response(401).json(UNAUTHORIZED);
    const reservation = mockAccount.get(user).reservations.active.find((item) => item.id === params.id);
    if (!reservation) return response(404).json({ code: "not_found", message: "Такой брони нет" });
    if (reservation.extended) return response(409).json({ code: "cannot_extend", message: "Бронь уже продлевали" });
    const account = mockAccount.update(user, (state) => {
      const target = state.reservations.active.find((item) => item.id === params.id)!;
      target.holdUntil = plusDays(target.holdUntil, 3);
      target.extended = true;
    });
    return response(200).json(account.reservations.active.find((item) => item.id === params.id)!);
  }),

  mockHttp.post("/me/reservations/{id}/cancel", async ({ params, response }) => {
    await delay(500);
    const user = mockSession.user();
    if (!user) return response(401).json(UNAUTHORIZED);
    const reservation = mockAccount.get(user).reservations.active.find((item) => item.id === params.id);
    if (!reservation) return response(404).json({ code: "not_found", message: "Такой брони нет" });
    const cancelled = { ...reservation, status: "cancelled" as const };
    mockAccount.update(user, (state) => {
      state.reservations.active = state.reservations.active.filter((item) => item.id !== params.id);
      state.reservations.history.unshift(cancelled);
    });
    return response(200).json(cancelled);
  }),
];
