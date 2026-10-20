import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { HALL_CAPACITY, isHallDateAllowed, requestNumber } from "@wine/demo-data";

let sequence = 0;

/** Заявка на зал по правилам сервиса requests: вместимость рассадки и даты с завтрашнего дня до года вперёд */
export const requestHallHandlers = [
  mockHttp.post("/requests/hall", async ({ request, response }) => {
    await delay(600);
    const body = await request.json();
    if (!/^\+7\d{10}$/.test(body.phone) || !body.consents.personalData) {
      return response(422).json({ code: "invalid_request", message: "Проверьте поля заявки" });
    }
    if (body.guests > HALL_CAPACITY[body.layout]) {
      return response(422).json({ code: "invalid_request", message: `В этой рассадке — до ${HALL_CAPACITY[body.layout]} гостей` });
    }
    if (!isHallDateAllowed(body.date, new Date())) {
      return response(422).json({ code: "invalid_request", message: "Выберите дату с завтрашнего дня и не дальше чем через год" });
    }
    sequence += 1;
    return response(201).json({ id: crypto.randomUUID(), number: requestNumber(sequence) });
  }),
];
