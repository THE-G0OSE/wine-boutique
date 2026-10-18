import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const newsletterHandlers = [
  mockHttp.post("/newsletter", async ({ request, response }) => {
    await delay();
    const { email } = await request.json();
    if (!EMAIL_RE.test(email)) {
      return response(422).json({ code: "invalid_email", message: "Проверьте адрес — кажется, в нём опечатка" });
    }
    return response(204).empty();
  }),
];
