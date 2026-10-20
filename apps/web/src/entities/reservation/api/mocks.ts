import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { mockReservations } from "./mockStore";

export const reservationHandlers = [
  mockHttp.get("/reservations/{id}", async ({ params, response }) => {
    await delay();
    const reservation = mockReservations.find(params.id);
    if (!reservation) return response(404).json({ code: "not_found", message: "Такой брони нет" });
    return response(200).json(reservation);
  }),
];
