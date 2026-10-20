import { delay } from "msw";
import { mockTastings } from "@/entities/tasting/mocks";
import { mockHttp } from "@/shared/api/mockHttp";
import { findTastingFixture, TASTING_MAX_GUESTS, toTasting } from "@wine/demo-data";

const INVALID = { code: "invalid_booking", message: "Проверьте имя и телефон и отметьте согласие" };

const isValid = (body: { name: string; phone: string; guests: number; consents: { personalData: boolean } }) =>
  body.name.trim().length > 0 &&
  /^\+7\d{10}$/.test(body.phone) &&
  Number.isInteger(body.guests) &&
  body.guests >= 1 &&
  body.guests <= TASTING_MAX_GUESTS &&
  body.consents.personalData;

/** Запись и лист ожидания по правилам эталона @wine/demo-data — как их примет сервис tastings */
export const bookTastingHandlers = [
  mockHttp.post("/tastings/{id}/bookings", async ({ params, request, response }) => {
    await delay(600);
    const now = new Date();
    const fixture = findTastingFixture(params.id, now);
    if (!fixture) return response(404).json({ code: "not_found", message: "Такой дегустации нет" });
    const body = await request.json();
    if (!isValid(body)) return response(422).json(INVALID);
    const tasting = toTasting(fixture, now, mockTastings.taken(fixture.id));
    if (tasting.status === "past") return response(409).json({ code: "tasting_closed", message: "Дегустация уже началась" });
    if (tasting.seatsLeft < body.guests) {
      return response(409).json({
        code: "not_enough_seats",
        message: tasting.seatsLeft ? `Осталось мест: ${tasting.seatsLeft}` : "Мест не осталось — запишитесь в лист ожидания",
        details: { seatsLeft: tasting.seatsLeft },
      });
    }
    mockTastings.book(fixture.id, body.guests);
    return response(201).json({
      id: crypto.randomUUID(),
      tasting: toTasting(fixture, now, mockTastings.taken(fixture.id)),
      guests: body.guests,
      customerName: body.name.trim(),
    });
  }),

  mockHttp.post("/tastings/{id}/waitlist", async ({ params, request, response }) => {
    await delay(600);
    const now = new Date();
    const fixture = findTastingFixture(params.id, now);
    if (!fixture) return response(404).json({ code: "not_found", message: "Такой дегустации нет" });
    const body = await request.json();
    if (!isValid(body)) return response(422).json(INVALID);
    const tasting = toTasting(fixture, now, mockTastings.taken(fixture.id));
    if (tasting.status === "past") return response(409).json({ code: "tasting_closed", message: "Дегустация уже началась" });
    if (tasting.status === "open") return response(409).json({ code: "seats_available", message: "Место освободилось — можно записаться" });
    mockTastings.wait(fixture.id, body.phone);
    return response(204).empty();
  }),
];
