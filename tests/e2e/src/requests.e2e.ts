import {
  zCreateCertificateResponse,
  zCreateGiftRequestResponse,
  zCreateHallRequestResponse,
  zCreateMonthlySubscriptionResponse,
  zGetMonthlyCratesResponse,
} from "@wine/contracts/openapi/zod";
import { afterAll, describe, expect, it } from "vitest";
import { compose, request } from "./gateway.js";

/** Дата через n дней по Москве */
const inDays = (days: number) => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [y, m, d] = today.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

/** Заявки через шлюз: зал, подарки, набор месяца и сертификат — в одном сервисе requests */
describe("заявки через шлюз", () => {
  const PHONE = "+79990000000";

  afterAll(() => {
    // Убираем только то, что создал тест: всё с тестовым телефоном
    compose(
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      "postgres",
      "-d",
      "requests",
      "-qc",
      `DELETE FROM service_requests WHERE phone = '${PHONE}'; DELETE FROM monthly_subscriptions WHERE phone = '${PHONE}'; DELETE FROM certificates WHERE phone = '${PHONE}'`
    );
  });

  const post = async (path: string, body: object) => {
    const res = await request(path, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:5174" },
      body: JSON.stringify({ ...body, phone: PHONE, consents: { personalData: true } }),
    });
    return { status: res.status, body: await res.json() };
  };

  it("зал и подарки — номер заявки; гостей больше вместимости — 422", async () => {
    const hall = await post("/api/requests/hall", { layout: "lecture", date: inDays(10), guests: 20 });
    expect(hall.status, JSON.stringify(hall.body)).toBe(201);
    expect(zCreateHallRequestResponse.parse(hall.body).number).toMatch(/^R-\d{6}$/);
    expect((await post("/api/requests/hall", { layout: "lecture", date: inDays(10), guests: 25 })).status).toBe(422);

    const gift = await post("/api/requests/gift", {
      pack: "kraft",
      bottles: 1,
      extras: [],
      run: "from10",
      company: "Сквозной тест (e2e)",
      contactName: "Тест",
      email: "e2e@example.ru",
    });
    expect(gift.status, JSON.stringify(gift.body)).toBe(201);
    zCreateGiftRequestResponse.parse(gift.body);
  });

  it("набор месяца: текущий ящик и архив, подписка", async () => {
    const crates = zGetMonthlyCratesResponse.parse(await (await request("/api/monthly")).json());
    expect(crates.current.wines.length).toBeGreaterThan(0);
    const subscription = await post("/api/monthly/subscriptions", { plan: "duo", name: "Сквозной тест (e2e)", boutiqueId: "street" });
    expect(subscription.status, JSON.stringify(subscription.body)).toBe(201);
    expect(zCreateMonthlySubscriptionResponse.parse(subscription.body).number).toMatch(/^M-\d{6}$/);
  });

  it("сертификат ждёт оплаты", async () => {
    const certificate = await post("/api/certificates", { nominal: 5000, to: "Тесту", from: "Тесту", format: "envelope" });
    expect(certificate.status, JSON.stringify(certificate.body)).toBe(201);
    expect(zCreateCertificateResponse.parse(certificate.body)).toMatchObject({ nominal: 5000, status: "awaiting_payment" });
  });
});
