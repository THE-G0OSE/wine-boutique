import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { cellarCellFixtures } from "@wine/demo-data";

const INVALID = { code: "invalid_request", message: "Проверьте имя, телефон и выбранную ячейку" };

/** Заявка на ячейку по правилам сервиса cellar: только на свободную, ячейку не занимает */
export const requestCellHandlers = [
  mockHttp.post("/cellar/requests", async ({ request, response }) => {
    await delay(600);
    const body = await request.json();
    const cell = cellarCellFixtures.find(({ number }) => number === body.cellNumber);
    if (!cell || !body.name.trim() || !/^\+7\d{10}$/.test(body.phone) || !body.consents.personalData) return response(422).json(INVALID);
    if (cell.status === "busy") return response(409).json({ code: "cell_busy", message: "Эту ячейку уже заняли — выберите другую" });
    return response(201).json({ id: crypto.randomUUID(), cellNumber: cell.number, tier: cell.tier, term: body.term });
  }),
];
