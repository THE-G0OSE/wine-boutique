import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { boutiqueFixtures, pickupDays } from "@wine/demo-data";

/** Слоты считает эталон @wine/demo-data — те же правила, что у сервиса reservations */
export const boutiqueHandlers = [
  mockHttp.get("/boutiques", async ({ response }) => {
    await delay();
    return response(200).json(boutiqueFixtures);
  }),

  mockHttp.get("/boutiques/{id}/slots", async ({ params, response }) => {
    await delay();
    const boutique = boutiqueFixtures.find(({ id }) => id === params.id);
    if (!boutique) return response(404).json({ code: "not_found", message: "Такого бутика нет" });
    return response(200).json(pickupDays(boutique, new Date()));
  }),
];
