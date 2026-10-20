import { delay } from "msw";
import { mockAccount } from "@/entities/account/mocks";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp } from "@/shared/api/mockHttp";

const UNAUTHORIZED = { code: "unauthorized", message: "Войдите, чтобы продолжить" };

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("ru"))
    .join("");

export const editProfileHandlers = [
  mockHttp.patch("/me", async ({ request, response }) => {
    await delay(500);
    const user = mockSession.user();
    if (!user) return response(401).json(UNAUTHORIZED);
    const body = await request.json();
    if (body.name !== undefined && !body.name.trim()) return response(422).json({ code: "invalid_profile", message: "Имя не может быть пустым" });
    const account = mockAccount.update(user, (state) => {
      Object.assign(state.profile, body, body.name ? { name: body.name.trim() } : {});
    });
    if (body.name) mockSession.signIn({ ...user, name: body.name.trim(), initials: initials(body.name) });
    return response(200).json(account.profile);
  }),

  mockHttp.post("/me/sign-out-everywhere", async ({ response }) => {
    await delay(400);
    if (!mockSession.user()) return response(401).json(UNAUTHORIZED);
    mockSession.signOut();
    return response(204).empty();
  }),

  mockHttp.delete("/me", async ({ response }) => {
    await delay(600);
    const user = mockSession.user();
    if (!user) return response(401).json(UNAUTHORIZED);
    mockAccount.clear(user);
    mockSession.signOut();
    return response(204).empty();
  }),
];
