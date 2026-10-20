import type { ApiSchemas } from "@/shared/api";

const KEY = "wine-boutique:mock-session";

/**
 * «Cookie» мок-сервера: вошедший гость живёт в sessionStorage вкладки.
 * Только для моков — настоящую сессию держит httpOnly-cookie сервиса identity.
 */
export const mockSession = {
  user(): ApiSchemas["SessionUser"] | null {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? "null") as ApiSchemas["SessionUser"] | null;
    } catch {
      return null;
    }
  },
  signIn(user: ApiSchemas["SessionUser"]) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(user));
    } catch {
      // Хранилище недоступно (приватный режим) — вход продержится до перезагрузки
    }
  },
  signOut() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // Нечего стирать
    }
  },
};
