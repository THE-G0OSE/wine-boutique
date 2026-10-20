import { delay } from "msw";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp } from "@/shared/api/mockHttp";
import { DEMO_GUEST } from "@wine/demo-data";

/**
 * Вход в моках, как в макете: код 1988 — новый гость (регистрация), 2015 — уже с картой (Анна из макета кабинета).
 * Остальные коды не подходят; после пяти неверных код сгорает. Правила сроков — как в сервисе identity.
 */
const MOCK_REGISTRATION = "mock-registration";
let attempts = 0;

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("ru"))
    .join("");

const adult = (birthDate: string) => {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const today = new Date();
  const [ty, tm, td] = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0) >= 18;
};

export const authHandlers = [
  mockHttp.post("/auth/phone/code", async ({ request, response }) => {
    await delay(500);
    const { phone } = await request.json();
    if (!/^\+7\d{10}$/.test(phone)) return response(422).json({ code: "invalid_phone", message: "Проверьте номер телефона" });
    attempts = 0;
    return response(202).json({ resendAfter: 60, expiresIn: 300 });
  }),

  mockHttp.post("/auth/phone/verify", async ({ request, response }) => {
    await delay(500);
    const { code } = await request.json();
    if (attempts >= 5) return response(410).json({ code: "code_expired", message: "Попытки кончились — запросите новый код" });
    if (code === "1988") return response(200).json({ status: "needs_registration" as const, registrationToken: MOCK_REGISTRATION });
    if (code === "2015") {
      const user = { id: DEMO_GUEST.id, name: DEMO_GUEST.name, initials: "АК", cardNumber: DEMO_GUEST.cardNumber };
      mockSession.signIn(user);
      return response(200).json({ status: "signed_in" as const, user });
    }
    attempts += 1;
    return response(422).json({ code: "invalid_code", message: "Код не подошёл — проверьте цифры или запросите новый", details: { attemptsLeft: 5 - attempts } });
  }),

  mockHttp.post("/auth/register", async ({ request, response }) => {
    await delay(600);
    const body = await request.json();
    if (body.registrationToken !== MOCK_REGISTRATION) return response(410).json({ code: "registration_expired", message: "Подтвердите номер заново" });
    if (!adult(body.birthDate)) return response(422).json({ code: "underage", message: "Кабинет доступен только с 18 лет" });
    const user = { id: crypto.randomUUID(), name: body.name.trim(), initials: initials(body.name), cardNumber: String(Date.now()).slice(-12).padStart(12, "4") };
    mockSession.signIn(user);
    return response(201).json({ user });
  }),
];
