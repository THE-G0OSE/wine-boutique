import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";

export const writeLetterHandlers = [
  mockHttp.post("/reviews", async ({ request, response }) => {
    await delay(800);
    const { name, text } = await request.json();
    if (!name.trim() || text.trim().length < 10) {
      return response(422).json({ code: "invalid_letter", message: "Подпишите конверт и напишите хотя бы пару строк" });
    }
    return response(202).empty();
  }),
];
