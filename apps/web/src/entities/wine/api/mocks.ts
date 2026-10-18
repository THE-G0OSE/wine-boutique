import { delay } from "msw";
import { mockHttp, withAssetBase } from "@/shared/api/mockHttp";
import type { WineSort, WineSummary } from "../model/types";
import { wineFixtureList } from "@wine/demo-data";

const byNullsLast = (a: number | null, b: number | null, direction: 1 | -1) => {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return (a - b) * direction;
};

const sorters: Record<WineSort, (a: WineSummary, b: WineSummary) => number> = {
  popular: () => 0,
  new: (a, b) => byNullsLast(a.vintage, b.vintage, -1),
  vintage_asc: (a, b) => byNullsLast(a.vintage, b.vintage, 1),
  price_asc: (a, b) => byNullsLast(a.price, b.price, 1),
  price_desc: (a, b) => byNullsLast(a.price, b.price, -1),
};

export const wineHandlers = [
  mockHttp.get("/wines", async ({ query, response }) => {
    await delay();
    const category = query.get("category");
    const sort = query.get("sort") ?? "popular";
    const limit = Number(query.get("limit") ?? 12);
    const offset = Number(query.get("offset") ?? 0);

    const filtered = wineFixtureList
      .filter((wine) => !category || wine.categories.includes(category))
      .sort(sorters[sort]);

    return response(200).json(withAssetBase({ items: filtered.slice(offset, offset + limit), total: filtered.length }));
  }),
];
