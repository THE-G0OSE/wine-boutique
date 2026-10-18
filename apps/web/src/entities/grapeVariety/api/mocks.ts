import { delay } from "msw";
import { mockHttp, withAssetBase } from "@/shared/api/mockHttp";
import { grapeFixtures } from "@wine/demo-data";

export const grapeHandlers = [
  mockHttp.get("/grapes", async ({ response }) => {
    await delay();
    return response(200).json(withAssetBase(grapeFixtures));
  }),
];
