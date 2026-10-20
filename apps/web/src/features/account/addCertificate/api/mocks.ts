import { delay } from "msw";
import { mockAccount } from "@/entities/account/mocks";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp } from "@/shared/api/mockHttp";

/** Любой номер нужного вида считается оплаченным сертификатом на 5 000 ₽ (в сервисе — только оформленные и оплаченные) */
export const addCertificateHandlers = [
  mockHttp.post("/me/certificates", async ({ request, response }) => {
    await delay(500);
    const user = mockSession.user();
    if (!user) return response(401).json({ code: "unauthorized", message: "Войдите, чтобы продолжить" });
    const { serial } = await request.json();
    if (!/^WB-\d{4}-\d{6}$/.test(serial)) return response(404).json({ code: "not_found", message: "Такого сертификата нет — проверьте номер" });
    if (mockAccount.get(user).certificates.some((item) => item.serial === serial)) {
      return response(409).json({ code: "certificate_unavailable", message: "Этот сертификат уже в кабинете" });
    }
    const today = new Date();
    const certificate = {
      serial,
      nominal: 5_000,
      balance: 5_000,
      validUntil: `${today.getFullYear() + 1}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
      from: "команды «Север»",
      status: "active" as const,
    };
    mockAccount.update(user, (state) => state.certificates.push(certificate));
    return response(201).json(certificate);
  }),
];
