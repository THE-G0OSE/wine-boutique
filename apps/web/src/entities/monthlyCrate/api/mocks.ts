import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { monthlyCrateFixtures, monthlyCrates } from "@wine/demo-data";

/** Текущий ящик и архив считает эталон @wine/demo-data — как сервис requests */
export const monthlyHandlers = [
  mockHttp.get("/monthly", async ({ response }) => {
    await delay();
    const crates = monthlyCrates(monthlyCrateFixtures, new Date());
    if (!crates) return response(404).json({ code: "not_found", message: "Ящиков пока нет" });
    return response(200).json(crates);
  }),
];
