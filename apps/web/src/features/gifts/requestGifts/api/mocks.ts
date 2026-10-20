import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { requestNumber } from "@wine/demo-data";

let sequence = 0;

/** Запрос сметы на подарки — как его примет сервис requests */
export const requestGiftsHandlers = [
  mockHttp.post("/requests/gift", async ({ request, response }) => {
    await delay(600);
    const body = await request.json();
    if (!body.company.trim() || !body.contactName.trim() || !/^\+7\d{10}$/.test(body.phone) || !body.consents.personalData) {
      return response(422).json({ code: "invalid_request", message: "Укажите компанию и контактное лицо" });
    }
    sequence += 1;
    return response(201).json({ id: crypto.randomUUID(), number: requestNumber(sequence) });
  }),
];
