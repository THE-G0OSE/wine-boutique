import { delay } from "msw";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp } from "@/shared/api/mockHttp";

/** Выход в моках: стираем «cookie» сессии */
export const signOutHandlers = [
  mockHttp.post("/auth/logout", async ({ response }) => {
    await delay(200);
    mockSession.signOut();
    return response(204).empty();
  }),
];
