import { zCreateTastingBookingResponse, zGetTastingsResponse } from "@wine/contracts/openapi/zod";
import { afterAll, describe, expect, it } from "vitest";
import { compose, request } from "./gateway.js";

/** Месяц афиши по часам погреба: 0 — текущий */
const month = (offset: number) => {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit" }).format(new Date()).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + offset, 1)).toISOString().slice(0, 7);
};

/** Дегустации через шлюз: афиша, запись с местами и защита формы от чужого сайта */
describe("дегустации через шлюз", () => {
  const created: { id: string; tastingId: string; guests: number }[] = [];

  afterAll(() => {
    // Возвращаем места и убираем записи теста — афиша остаётся как после сида
    for (const { id, tastingId, guests } of created) {
      compose(
        "exec",
        "-T",
        "postgres",
        "psql",
        "-U",
        "postgres",
        "-d",
        "tastings",
        "-qc",
        `DELETE FROM bookings WHERE id = '${id}'; UPDATE tastings SET seats_taken = seats_taken - ${guests} WHERE id = '${tastingId}'`
      );
    }
  });

  const json = async (path: string, init?: RequestInit) => {
    const res = await request(path, init);
    return { status: res.status, body: res.status === 204 ? null : await res.json() };
  };
  const book = (id: string, origin: string) =>
    json(`/api/tastings/${id}/bookings`, {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify({ name: "Сквозной тест (e2e)", phone: "+79990000000", guests: 1, consents: { personalData: true } }),
    });

  it("афиша на три месяца вперёд, запись занимает место", async () => {
    const lists = await Promise.all([0, 1, 2].map(async (offset) => zGetTastingsResponse.parse((await json(`/api/tastings?month=${month(offset)}`)).body)));
    const all = lists.flat();
    expect(all.length).toBeGreaterThan(0);
    const open = all.find((tasting) => tasting.status === "open" && tasting.seatsLeft > 1)!;

    const { status, body } = await book(open.id, "http://localhost:5174");
    expect(status, JSON.stringify(body)).toBe(201);
    const booking = zCreateTastingBookingResponse.parse(body);
    created.push({ id: booking.id, tastingId: open.id, guests: 1 });
    expect(booking.tasting.seatsLeft).toBe(open.seatsLeft - 1);

    const again = zGetTastingsResponse.parse((await json(`/api/tastings?month=${open.id.slice(0, 7)}`)).body);
    expect(again.find((tasting) => tasting.id === open.id)?.seatsLeft).toBe(open.seatsLeft - 1);
  });

  it("запись с чужого сайта — 403 forbidden_origin", async () => {
    const all = zGetTastingsResponse.parse((await json(`/api/tastings?month=${month(1)}`)).body);
    const { status, body } = await book(all[0].id, "https://evil.example");
    expect(status).toBe(403);
    expect(body).toMatchObject({ code: "forbidden_origin" });
  });
});
