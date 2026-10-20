import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { certificateSerial, certificateValidUntil } from "@wine/demo-data";

let sequence = 0;

/** Сертификат по правилам сервиса requests: ждёт оплаты, действует год, электронному нужен e-mail получателя */
export const issueCertificateHandlers = [
  mockHttp.post("/certificates", async ({ request, response }) => {
    await delay(700);
    const body = await request.json();
    const invalid = (message: string) => response(422).json({ code: "invalid_request", message });
    if (!body.to.trim() || !body.from.trim()) return invalid("Напишите, кому и от кого сертификат");
    if (body.format === "email" && !body.recipientEmail?.trim()) return invalid("Для электронного сертификата нужен e-mail получателя");
    if (body.nominal < 3000 || body.nominal > 300_000 || !/^\+7\d{10}$/.test(body.phone) || !body.consents.personalData) return invalid("Проверьте поля заявки");
    sequence += 1;
    const now = new Date();
    return response(201).json({
      id: crypto.randomUUID(),
      serial: certificateSerial(Number(certificateValidUntil(now).slice(0, 4)) - 1, sequence),
      nominal: body.nominal,
      validUntil: certificateValidUntil(now),
      status: "awaiting_payment" as const,
    });
  }),
];
