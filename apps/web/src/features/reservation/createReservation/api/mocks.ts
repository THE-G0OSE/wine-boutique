import { delay } from "msw";
import { mockReservations } from "@/entities/reservation/mocks";
import { mockHttp, withAssetBase } from "@/shared/api/mockHttp";
import {
  boutiqueFixtures,
  holdUntilOf,
  isSlotAvailable,
  reservationNumber,
  toWineSummary,
  toZonedIso,
  wineFixtureList,
  zonedInstant,
} from "@wine/demo-data";

/** Бронь по правилам эталона @wine/demo-data — как её примет сервис reservations */
export const createReservationHandlers = [
  mockHttp.post("/reservations", async ({ request, response }) => {
    await delay(700);
    const body = await request.json();
    const boutique = boutiqueFixtures.find(({ id }) => id === body.boutiqueId);
    const name = body.name.trim();
    if (!boutique || !name || !/^\+7\d{10}$/.test(body.phone) || !body.consents.adult || !body.consents.personalData) {
      return response(422).json({ code: "invalid_reservation", message: "Проверьте имя, телефон и отметьте обе галочки" });
    }
    const now = new Date();
    if (!isSlotAvailable(boutique, body.date, body.time, now)) {
      return response(422).json({ code: "slot_unavailable", message: "Это время уже недоступно — выберите другое" });
    }
    // В моках id вина — его slug
    const unknown = body.items.filter(({ wineId }) => !wineFixtureList.some((wine) => wine.id === wineId));
    if (unknown.length) {
      return response(422).json({
        code: "unknown_wines",
        message: "Некоторых бутылок уже нет на полках — уберите их из корзины",
        details: unknown.map(({ wineId }) => wineId),
      });
    }
    const items = body.items.map(({ wineId, qty }) => {
      const wine = toWineSummary(wineFixtureList.find((fixture) => fixture.id === wineId)!);
      return { wineId, slug: wine.slug, name: wine.name, image: wine.image, qty, price: wine.price };
    });
    const total = items.every((item) => item.price !== null) ? items.reduce((sum, item) => sum + item.price! * item.qty, 0) : null;
    const reservation = {
      id: crypto.randomUUID(),
      number: reservationNumber(mockReservations.all().length + 1),
      status: "active" as const,
      createdAt: now.toISOString(),
      pickupAt: toZonedIso(zonedInstant(body.date, body.time, boutique.timezone), boutique.timezone),
      holdUntil: toZonedIso(holdUntilOf(boutique, body.date), boutique.timezone),
      boutique,
      customerName: name,
      items,
      total,
    };
    mockReservations.add(reservation);
    return response(201).json(withAssetBase(reservation));
  }),
];
