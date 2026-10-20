import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { listTastings } from "@wine/demo-data";
import { mockTastings } from "./mockStore";

/** Афишу считает эталон @wine/demo-data — те же дни и места, что у сервиса tastings */
export const tastingHandlers = [
  mockHttp.get("/tastings", async ({ query, response }) => {
    await delay();
    const month = query.get("month") ?? "";
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return response(400).json({ code: "validation_failed", message: "Месяц — в формате 2026-10" });
    }
    return response(200).json(listTastings(month, new Date(), (id) => mockTastings.taken(id)));
  }),
];
