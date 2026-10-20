import { delay } from "msw";
import { mockSession } from "@/entities/session/mocks";
import { mockHttp, withAssetBase } from "@/shared/api/mockHttp";
import { mockAccount } from "./mockStore";

const UNAUTHORIZED = { code: "unauthorized", message: "Войдите, чтобы продолжить" };

/** Чтение кабинета: без «cookie» мока — 401, как отвечает шлюз */
export const accountHandlers = [
  mockHttp.get("/me", async ({ response }) => {
    await delay();
    const user = mockSession.user();
    return user ? response(200).json(mockAccount.get(user).profile) : response(401).json(UNAUTHORIZED);
  }),
  mockHttp.get("/me/reservations", async ({ response }) => {
    await delay();
    const user = mockSession.user();
    return user ? response(200).json(withAssetBase(mockAccount.get(user).reservations)) : response(401).json(UNAUTHORIZED);
  }),
  mockHttp.get("/me/tastings", async ({ response }) => {
    await delay();
    const user = mockSession.user();
    return user ? response(200).json(mockAccount.get(user).tastings) : response(401).json(UNAUTHORIZED);
  }),
  mockHttp.get("/me/cell", async ({ response }) => {
    await delay();
    const user = mockSession.user();
    return user ? response(200).json(withAssetBase({ cell: mockAccount.get(user).cell })) : response(401).json(UNAUTHORIZED);
  }),
  mockHttp.get("/me/monthly", async ({ response }) => {
    await delay();
    const user = mockSession.user();
    return user ? response(200).json({ subscription: mockAccount.get(user).monthly }) : response(401).json(UNAUTHORIZED);
  }),
  mockHttp.get("/me/certificates", async ({ response }) => {
    await delay();
    const user = mockSession.user();
    return user ? response(200).json(mockAccount.get(user).certificates) : response(401).json(UNAUTHORIZED);
  }),
  mockHttp.get("/me/loyalty", async ({ response }) => {
    await delay();
    const user = mockSession.user();
    return user ? response(200).json(mockAccount.get(user).loyalty) : response(401).json(UNAUTHORIZED);
  }),
  mockHttp.get("/me/favorites", async ({ response }) => {
    await delay();
    const user = mockSession.user();
    return user ? response(200).json(withAssetBase(mockAccount.get(user).favorites)) : response(401).json(UNAUTHORIZED);
  }),
];
