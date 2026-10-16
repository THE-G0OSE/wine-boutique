import { mockHttp } from "@/shared/api/mockHttp";

/** Вход появится в фазе «Личный кабинет»; пока посетитель всегда гость */
export const sessionHandlers = [
  mockHttp.get("/auth/session", ({ response }) => response(200).json({ user: null })),
];
