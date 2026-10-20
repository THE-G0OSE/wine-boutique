import { zCreateReservationResponse, zGetBoutiqueSlotsResponse, zGetBoutiquesResponse, zGetReservationResponse, zGetWinesResponse } from "@wine/contracts/openapi/zod";
import { afterAll, describe, expect, it } from "vitest";
import { compose, request } from "./gateway.js";

/** Бронь через шлюз: reservations берёт вина и цены у настоящего catalog по gRPC */
describe("бронь через шлюз", () => {
  const created: string[] = [];

  afterAll(() => {
    if (created.length === 0) return;
    const ids = created.map((id) => `'${id}'`).join(",");
    compose("exec", "-T", "postgres", "psql", "-U", "postgres", "-d", "reservations", "-qc", `DELETE FROM reservations WHERE id IN (${ids})`);
  });

  const json = async (path: string, init?: RequestInit) => {
    const res = await request(path, init);
    return { status: res.status, body: await res.json() };
  };

  it("бутики, слоты, бронь вина из catalog и квитанция", async () => {
    const boutiques = zGetBoutiquesResponse.parse((await json("/api/boutiques")).body);
    expect(boutiques.map((boutique) => boutique.id)).toEqual(["street", "cellar"]);

    const days = zGetBoutiqueSlotsResponse.parse((await json("/api/boutiques/street/slots")).body);
    const day = days.find((item) => item.times.length > 0)!;

    const wines = zGetWinesResponse.parse((await json("/api/wines?shelf=red&limit=2")).body);
    const { status, body } = await json("/api/reservations", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:5174" },
      body: JSON.stringify({
        boutiqueId: "street",
        date: day.date,
        time: day.times[0],
        name: "Сквозной тест (e2e)",
        phone: "+79990000000",
        items: wines.items.map((wine) => ({ wineId: wine.id, qty: 1 })),
        consents: { adult: true, personalData: true },
      }),
    });
    expect(status, JSON.stringify(body)).toBe(201);
    const reservation = zCreateReservationResponse.parse(body);
    created.push(reservation.id);
    expect(reservation.items.map((item) => item.slug)).toEqual(wines.items.map((wine) => wine.slug));

    const receipt = zGetReservationResponse.parse((await json(`/api/reservations/${reservation.id}`)).body);
    expect(receipt.number).toBe(reservation.number);
  });

  it("вино, которого нет в catalog, — 422 unknown_wines", async () => {
    const days = zGetBoutiqueSlotsResponse.parse((await json("/api/boutiques/street/slots")).body);
    const day = days.find((item) => item.times.length > 0)!;
    const { status, body } = await json("/api/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        boutiqueId: "street",
        date: day.date,
        time: day.times[0],
        name: "e2e",
        phone: "+79990000000",
        items: [{ wineId: "00000000-0000-7000-8000-000000000000", qty: 1 }],
        consents: { adult: true, personalData: true },
      }),
    });
    expect(status).toBe(422);
    expect(body).toMatchObject({ code: "unknown_wines" });
  });
});
