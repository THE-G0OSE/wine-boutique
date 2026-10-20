import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";

/** Подписки мок-сервера: один телефон — одна подписка, повтор возвращает тот же номер (как сервис requests) */
const numbers = new Map<string, number>();

export const subscribeMonthlyHandlers = [
  mockHttp.post("/monthly/subscriptions", async ({ request, response }) => {
    await delay(600);
    const body = await request.json();
    if (!body.name.trim() || !/^\+7\d{10}$/.test(body.phone) || !body.boutiqueId || !body.consents.personalData) {
      return response(422).json({ code: "invalid_request", message: "Напишите, как к вам обращаться" });
    }
    const number = numbers.get(body.phone) ?? numbers.size + 1;
    numbers.set(body.phone, number);
    return response(201).json({ id: crypto.randomUUID(), number: `M-${String(number).padStart(6, "0")}` });
  }),
];
