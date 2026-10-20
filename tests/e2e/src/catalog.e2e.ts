import { zGetSearchSuggestionsResponse, zGetShelvesResponse, zGetWineFacetsResponse, zGetWineResponse } from "@wine/contracts/openapi/zod";
import { describe, expect, it } from "vitest";
import { request } from "./gateway.js";

/** Магазин через шлюз: новые пути каталога маршрутизируются в catalog и отвечают по контракту */
describe("магазин через шлюз", () => {
  const json = async (path: string) => {
    const res = await request(path);
    expect(res.status, path).toBe(200);
    return res.json();
  };

  it("полки, фасеты, карточка и подсказки — из catalog", async () => {
    const shelves = zGetShelvesResponse.parse(await json("/api/shelves?limit=3"));
    expect(shelves.map((shelf) => shelf.id)).toEqual(["red", "white", "sparkling", "aged"]);
    expect(shelves.every((shelf) => shelf.wines.length <= 3)).toBe(true);

    const facets = zGetWineFacetsResponse.parse(await json(`/api/wines/facets?shelf=red&country=${encodeURIComponent("Италия")}`));
    expect(facets.countries.find((option) => option.value === "Италия")?.count).toBe(facets.total);

    const card = zGetWineResponse.parse(await json("/api/wines/sassicaia-2015"));
    expect(card).toMatchObject({ shelf: "red", producer: "Tenuta San Guido" });

    const suggestions = zGetSearchSuggestionsResponse.parse(await json(`/api/search/suggest?q=${encodeURIComponent("пино")}`));
    expect(suggestions.grapes).toEqual(["Пино нуар", "Пино гри"]);
  });

  it("неизвестное вино — 404 от catalog в формате контракта", async () => {
    const res = await request("/api/wines/chateau-imaginaire-1900");
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ code: "not_found" });
  });
});
