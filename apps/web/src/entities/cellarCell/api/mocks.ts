import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { cellarCellFixtures } from "@wine/demo-data";

/** Стена из @wine/demo-data — та же, что сидит сервис cellar */
export const cellarHandlers = [
  mockHttp.get("/cellar/cells", async ({ response }) => {
    await delay();
    return response(200).json(cellarCellFixtures);
  }),
];
