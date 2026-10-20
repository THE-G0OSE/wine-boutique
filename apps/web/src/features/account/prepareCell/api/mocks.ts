import { delay } from "msw";
import { mockAccount } from "@/entities/account/mocks";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp } from "@/shared/api/mockHttp";

/** Подготовка к визиту — по правилам сервиса cellar: бутылки из описи, визит не раньше чем через 2 часа */
export const prepareCellHandlers = [
  mockHttp.post("/me/cell/prepare", async ({ request, response }) => {
    await delay(500);
    const user = mockSession.user();
    if (!user) return response(401).json({ code: "unauthorized", message: "Войдите, чтобы продолжить" });
    const { cell } = mockAccount.get(user);
    if (!cell) return response(404).json({ code: "not_found", message: "Ячейки нет" });
    const body = await request.json();
    const known = body.bottleIds.every((id) => cell.bottles.some((bottle) => bottle.id === id));
    if (!known || new Date(body.visitAt).getTime() < Date.now() + 2 * 60 * 60 * 1000) {
      return response(422).json({ code: "invalid_preparation", message: "Визит — не раньше чем через 2 часа" });
    }
    const preparation = { bottleIds: body.bottleIds, visitAt: body.visitAt };
    mockAccount.update(user, (state) => {
      if (state.cell) state.cell.preparation = preparation;
    });
    return response(202).json(preparation);
  }),
];
