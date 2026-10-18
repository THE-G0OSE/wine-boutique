import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { reviewsFixture } from "./fixtures";

export const reviewHandlers = [
  mockHttp.get("/reviews", async ({ query, response }) => {
    await delay();
    const limit = Number(query.get("limit") ?? 5);
    const offset = Number(query.get("offset") ?? 0);
    return response(200).json({ items: reviewsFixture.slice(offset, offset + limit), total: reviewsFixture.length });
  }),
];
