import { mockHttp } from "@/shared/api/mockHttp";
import { mockSession } from "./mockStore";

/** Кто вошёл: «cookie» мока — в sessionStorage (вход — features/auth/byPhone) */
export const sessionHandlers = [mockHttp.get("/auth/session", ({ response }) => response(200).json({ user: mockSession.user() }))];
