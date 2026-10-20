import type { components } from "@wine/contracts/openapi";
import { reservationNumber, toZonedIso, type Boutique } from "../domain/pickup.js";
import { totalRubles, type Reservation } from "../domain/reservation.js";

type Schemas = components["schemas"];

export const toBoutiqueContract = (boutique: Boutique): Schemas["Boutique"] => ({ ...boutique });

/** Квитанция в формате контракта: время — по часам бутика, цены — в рублях; телефон и почта наружу не уходят */
export const toReservationContract = (reservation: Reservation, boutique: Boutique): Schemas["Reservation"] => ({
  id: reservation.id,
  number: reservationNumber(reservation.number),
  status: reservation.status,
  createdAt: reservation.createdAt.toISOString(),
  pickupAt: toZonedIso(reservation.pickupAt, boutique.timezone),
  holdUntil: toZonedIso(reservation.holdUntil, boutique.timezone),
  boutique: toBoutiqueContract(boutique),
  customerName: reservation.customerName,
  items: reservation.items.map((item) => ({
    wineId: item.wineId,
    slug: item.slug,
    name: item.name,
    image: item.imageUrl,
    qty: item.qty,
    price: item.priceKopecks === null ? null : Math.round(item.priceKopecks / 100),
  })),
  total: totalRubles(reservation.items),
});

/** Бронь в кабинете — то же, что квитанция, и отметка о продлении */
export const toMyReservationContract = (reservation: Reservation, boutique: Boutique): Schemas["MyReservation"] => ({
  ...toReservationContract(reservation, boutique),
  extended: reservation.extended,
});
