import {
  zGetBoutiqueSlotsResponse,
  zGetCellarCellsResponse,
  zGetMyCellResponse,
  zGetMyCertificatesResponse,
  zGetMyFavoritesResponse,
  zGetMyLoyaltyResponse,
  zGetMyMonthlyResponse,
  zGetMyReservationsResponse,
  zGetMyTastingsResponse,
  zGetProfileResponse,
  zGetTastingsResponse,
  zGetWinesResponse,
  zVerifyPhoneCodeResponse,
} from "@wine/contracts/openapi/zod";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compose, request } from "./gateway.js";

const PHONE = "+79990000777";
const ORIGIN = { origin: "http://localhost:5174" };
const sql = (database: string, query: string) => compose("exec", "-T", "postgres", "psql", "-U", "postgres", "-d", database, "-qc", query);

/** Месяц афиши по часам погреба: 0 — текущий */
const month = (offset: number) => {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit" }).format(new Date()).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + offset, 1)).toISOString().slice(0, 7);
};

/**
 * Кабинет через шлюз: вход по телефону (код — из лога identity: SMS-провайдера ещё нет), затем брони, запись,
 * подписка, ячейка, сертификат, бонусы и избранное — каждый сервис видит гостя по X-User-Id от шлюза
 */
describe("кабинет через шлюз", () => {
  let cookie = "";
  let userId = "";
  let cellNumber = "";
  let bookedTasting = "";

  const json = async (path: string, init: RequestInit = {}) => {
    const res = await request(path, { ...init, headers: { cookie, ...ORIGIN, "content-type": "application/json", ...(init.headers ?? {}) } });
    return { status: res.status, body: res.status === 204 ? null : await res.json(), headers: res.headers };
  };

  beforeAll(async () => {
    sql("identity", `DELETE FROM users WHERE phone = '${PHONE}'; DELETE FROM phone_codes WHERE phone = '${PHONE}'`);
    const sent = await request("/api/auth/phone/code", { method: "POST", headers: { ...ORIGIN, "content-type": "application/json" }, body: JSON.stringify({ phone: PHONE }) });
    expect(sent.status).toBe(202);
    const code = [...compose("logs", "identity", "--since", "2m").matchAll(new RegExp(`Код входа для \\${PHONE}: (\\d{4})`, "g"))].at(-1)?.[1];
    expect(code).toMatch(/^\d{4}$/);

    const verified = await request("/api/auth/phone/verify", { method: "POST", headers: { ...ORIGIN, "content-type": "application/json" }, body: JSON.stringify({ phone: PHONE, code }) });
    const verification = zVerifyPhoneCodeResponse.parse(await verified.json());
    expect(verification.status).toBe("needs_registration");
    const registered = await request("/api/auth/register", {
      method: "POST",
      headers: { ...ORIGIN, "content-type": "application/json" },
      body: JSON.stringify({
        registrationToken: verification.status === "needs_registration" ? verification.registrationToken : "",
        name: "Гость Кабинета (e2e)",
        birthDate: "1990-01-01",
        consents: { personalData: true, marketing: false },
      }),
    });
    expect(registered.status).toBe(201);
    cookie = (registered.headers.get("set-cookie") ?? "").split(";")[0];
    userId = ((await registered.json()) as { user: { id: string } }).user.id;
  }, 60_000);

  afterAll(() => {
    if (!userId) return;
    sql("reservations", `DELETE FROM reservations WHERE user_id = '${userId}'`);
    if (bookedTasting) sql("tastings", `UPDATE tastings SET seats_taken = seats_taken - 1 WHERE id = '${bookedTasting}'; DELETE FROM bookings WHERE user_id = '${userId}'`);
    sql("requests", `DELETE FROM monthly_subscriptions WHERE phone = '${PHONE}'; DELETE FROM certificates WHERE phone = '${PHONE}'`);
    if (cellNumber) sql("cellar", `DELETE FROM cell_leases WHERE user_id = '${userId}'; UPDATE cells SET status = 'free' WHERE number = '${cellNumber}'`);
    sql("loyalty", `DELETE FROM bonus_entries WHERE user_id = '${userId}'; DELETE FROM favorites WHERE user_id = '${userId}'`);
    sql("identity", `DELETE FROM users WHERE id = '${userId}'; DELETE FROM phone_codes WHERE phone = '${PHONE}'`);
  });

  it("без входа кабинет закрыт: 401 от шлюза на любом /api/me", async () => {
    for (const path of ["/api/me", "/api/me/reservations", "/api/me/cell", "/api/me/loyalty"]) {
      const res = await request(path);
      expect(res.status, path).toBe(401);
    }
  });

  it("профиль и правка имени", async () => {
    const profile = zGetProfileResponse.parse((await json("/api/me")).body);
    expect(profile).toMatchObject({ id: userId, phone: PHONE, birthDate: "1990-01-01" });
    expect(profile.cardNumber).toMatch(/^\d{12}$/);
    expect(profile.sessions[0].current).toBe(true);
    expect((await json("/api/me", { method: "PATCH", body: JSON.stringify({ tastes: ["aged"] }) })).body).toMatchObject({ tastes: ["aged"] });
  });

  it("бронь вошедшего гостя — в кабинете; продление и отмена", async () => {
    const days = zGetBoutiqueSlotsResponse.parse((await json("/api/boutiques/street/slots")).body);
    const day = days.find((item) => item.times.length > 0)!;
    const wines = zGetWinesResponse.parse((await json("/api/wines?shelf=red&limit=1")).body);
    const created = await json("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ boutiqueId: "street", date: day.date, time: day.times[0], name: "Гость (e2e)", phone: PHONE, items: [{ wineId: wines.items[0].id, qty: 1 }], consents: { adult: true, personalData: true } }),
    });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const mine = zGetMyReservationsResponse.parse((await json("/api/me/reservations")).body);
    expect(mine.active.map((item) => item.id)).toEqual([(created.body as { id: string }).id]);
    const id = mine.active[0].id;
    expect((await json(`/api/me/reservations/${id}/extend`, { method: "POST" })).status).toBe(200);
    expect((await json(`/api/me/reservations/${id}/cancel`, { method: "POST" })).body).toMatchObject({ status: "cancelled" });
  });

  it("запись на дегустацию — в «Моих дегустациях»", async () => {
    const all = (await Promise.all([0, 1, 2].map(async (offset) => zGetTastingsResponse.parse((await json(`/api/tastings?month=${month(offset)}`)).body)))).flat();
    const open = all.find((tasting) => tasting.status === "open" && tasting.seatsLeft > 1)!;
    const booked = await json(`/api/tastings/${open.id}/bookings`, { method: "POST", body: JSON.stringify({ name: "Гость (e2e)", phone: PHONE, guests: 1, consents: { personalData: true } }) });
    expect(booked.status).toBe(201);
    bookedTasting = open.id;
    expect(zGetMyTastingsResponse.parse((await json("/api/me/tastings")).body).map((item) => item.tasting.id)).toContain(open.id);
  });

  it("подписка на набор и пауза; сертификат — после оплаты привязывается по номеру", async () => {
    await json("/api/monthly/subscriptions", { method: "POST", body: JSON.stringify({ plan: "classic", name: "Гость (e2e)", phone: PHONE, boutiqueId: "street", consents: { personalData: true } }) });
    expect(zGetMyMonthlyResponse.parse((await json("/api/me/monthly")).body).subscription).toMatchObject({ plan: "classic", status: "active" });
    expect((await json("/api/me/monthly", { method: "PATCH", body: JSON.stringify({ status: "paused" }) })).body).toMatchObject({ subscription: { status: "paused" } });

    const issued = (await json("/api/certificates", { method: "POST", body: JSON.stringify({ nominal: 3000, to: "Себе", from: "Себя", format: "envelope", phone: PHONE, consents: { personalData: true } }) })).body as { serial: string };
    expect((await json("/api/me/certificates", { method: "POST", body: JSON.stringify({ serial: issued.serial }) })).status).toBe(409);
    compose("exec", "-T", "requests", "node", "dist/cli.js", "certificate:pay", issued.serial);
    expect((await json("/api/me/certificates", { method: "POST", body: JSON.stringify({ serial: issued.serial }) })).status).toBe(201);
    expect(zGetMyCertificatesResponse.parse((await json("/api/me/certificates")).body).map((item) => item.serial)).toEqual([issued.serial]);
  });

  it("ячейка: нет — null; после договора у управляющего — с описью", async () => {
    expect(zGetMyCellResponse.parse((await json("/api/me/cell")).body)).toEqual({ cell: null });
    cellNumber = zGetCellarCellsResponse.parse((await json("/api/cellar/cells")).body).find((cell) => cell.status === "free")!.number;
    compose("exec", "-T", "cellar", "node", "dist/cli.js", "lease:assign", "--user", userId, "--cell", cellNumber, "--until", "2027-10-16", "--demo");
    const { cell } = zGetMyCellResponse.parse((await json("/api/me/cell")).body);
    expect(cell).toMatchObject({ number: cellNumber, paidUntil: "2027-10-16" });
    expect(cell!.bottles.length).toBeGreaterThan(0);
  });

  it("бонусы: 500 приветственных; избранное — карточки вин из catalog по gRPC", async () => {
    expect(zGetMyLoyaltyResponse.parse((await json("/api/me/loyalty")).body)).toMatchObject({ balance: 500, level: "guest" });
    const wines = zGetWinesResponse.parse((await json("/api/wines?shelf=white&limit=2")).body);
    for (const wine of wines.items) expect((await json(`/api/me/favorites/${wine.id}`, { method: "PUT" })).status).toBe(204);
    const favorites = zGetMyFavoritesResponse.parse((await json("/api/me/favorites")).body);
    expect(favorites.map((wine) => wine.slug)).toEqual(wines.items.map((wine) => wine.slug).reverse());
    expect(favorites[0]).toMatchObject({ name: wines.items[1].name, volume: wines.items[1].volume, image: wines.items[1].image });
  });
});
