import { zCreateCellarRequestResponse, zGetCellarCellsResponse } from "@wine/contracts/openapi/zod";
import { afterAll, describe, expect, it } from "vitest";
import { compose, request } from "./gateway.js";

/** Погреб через шлюз: стена ячеек и заявка на свободную */
describe("погреб через шлюз", () => {
  const created: string[] = [];

  afterAll(() => {
    if (created.length === 0) return;
    const ids = created.map((id) => `'${id}'`).join(",");
    compose("exec", "-T", "postgres", "psql", "-U", "postgres", "-d", "cellar", "-qc", `DELETE FROM cell_requests WHERE id IN (${ids})`);
  });

  const json = async (path: string, init?: RequestInit) => {
    const res = await request(path, init);
    return { status: res.status, body: await res.json() };
  };
  const send = (cellNumber: string) =>
    json("/api/cellar/requests", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:5174" },
      body: JSON.stringify({ cellNumber, term: "1y", name: "Сквозной тест (e2e)", phone: "+79990000000", consents: { personalData: true } }),
    });

  it("стена из 32 ячеек; заявка на свободную принята, на занятую — 409", async () => {
    const cells = zGetCellarCellsResponse.parse((await json("/api/cellar/cells")).body);
    expect(cells).toHaveLength(32);
    const free = cells.find((cell) => cell.status === "free")!;
    const busy = cells.find((cell) => cell.status === "busy")!;

    const { status, body } = await send(free.number);
    expect(status, JSON.stringify(body)).toBe(201);
    const accepted = zCreateCellarRequestResponse.parse(body);
    created.push(accepted.id);
    expect(accepted).toMatchObject({ cellNumber: free.number, tier: free.tier, term: "1y" });

    const taken = await send(busy.number);
    expect(taken.status).toBe(409);
    expect(taken.body).toMatchObject({ code: "cell_busy" });
  });
});
