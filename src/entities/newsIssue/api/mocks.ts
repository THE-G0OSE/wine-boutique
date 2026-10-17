import { delay } from "msw";
import { mockHttp } from "@/shared/api/mockHttp";
import { latestIssueFixture } from "./fixtures";

export const newsHandlers = [
  mockHttp.get("/news/issues/latest", async ({ response }) => {
    await delay();
    return response(200).json(latestIssueFixture);
  }),
];
