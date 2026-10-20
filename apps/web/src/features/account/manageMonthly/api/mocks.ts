import { delay } from "msw";
import { mockAccount } from "@/entities/account/mocks";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp } from "@/shared/api/mockHttp";

/** Следующий месяц по Москве: «2026-11» */
const nextMonth = () => {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit" }).format(new Date()).split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
};

export const manageMonthlyHandlers = [
  mockHttp.patch("/me/monthly", async ({ request, response }) => {
    await delay(400);
    const user = mockSession.user();
    if (!user) return response(401).json({ code: "unauthorized", message: "Войдите, чтобы продолжить" });
    if (!mockAccount.get(user).monthly) return response(404).json({ code: "not_found", message: "Подписки нет" });
    const body = await request.json();
    const account = mockAccount.update(user, (state) => {
      if (!state.monthly) return;
      if (body.status) state.monthly.status = body.status;
      if (body.skipNext !== undefined) state.monthly.skipMonth = body.skipNext ? nextMonth() : null;
    });
    return response(200).json({ subscription: account.monthly });
  }),
];
