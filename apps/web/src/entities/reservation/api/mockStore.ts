import type { Reservation } from "../model/types";

const KEY = "wine-boutique:mock-reservations";

/**
 * Брони мок-сервера: живут в sessionStorage вкладки, чтобы квитанция открывалась и после F5.
 * Только для моков — настоящие брони хранит сервис reservations.
 */
export const mockReservations = {
  all(): Reservation[] {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as Reservation[];
    } catch {
      return [];
    }
  },
  find(id: string) {
    return this.all().find((reservation) => reservation.id === id);
  },
  add(reservation: Reservation) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify([...this.all(), reservation]));
    } catch {
      // Хранилище недоступно (приватный режим) — квитанция покажется до перезагрузки
    }
  },
};
