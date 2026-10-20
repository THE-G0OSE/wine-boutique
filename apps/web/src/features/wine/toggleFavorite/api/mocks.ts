import { delay } from "msw";
import { mockAccount } from "@/entities/account/mocks";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp } from "@/shared/api/mockHttp";
import { toWineSummary, wineFixtureList } from "@wine/demo-data";

const UNAUTHORIZED = { code: "unauthorized", message: "Войдите, чтобы продолжить" };

/** Избранное — как в сервисе loyalty: повтор PUT и DELETE того, чего нет, — тоже 204 */
export const toggleFavoriteHandlers = [
  mockHttp.put("/me/favorites/{wineId}", async ({ params, response }) => {
    await delay(300);
    const user = mockSession.user();
    if (!user) return response(401).json(UNAUTHORIZED);
    const wine = wineFixtureList.find((item) => item.id === params.wineId);
    if (!wine) return response(404).json({ code: "not_found", message: "Такого вина нет" });
    mockAccount.update(user, (state) => {
      if (!state.favorites.some((item) => item.id === wine.id)) state.favorites.unshift(toWineSummary(wine));
    });
    return response(204).empty();
  }),
  mockHttp.delete("/me/favorites/{wineId}", async ({ params, response }) => {
    await delay(300);
    const user = mockSession.user();
    if (!user) return response(401).json(UNAUTHORIZED);
    mockAccount.update(user, (state) => {
      state.favorites = state.favorites.filter((item) => item.id !== params.wineId);
    });
    return response(204).empty();
  }),
];
