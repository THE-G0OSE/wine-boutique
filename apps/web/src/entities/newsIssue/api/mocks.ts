import { delay } from "msw";
import { mockHttp, withAssetBase } from "@/shared/api/mockHttp";
import type { NewsArchiveMonth } from "../model/types";
import { archiveIssuesFixture, latestIssueFixture } from "@wine/demo-data";

const monthOf = (isoDate: string) => isoDate.slice(0, 7);

/** Месяцы подшивки от свежего к старому со счётчиком выпусков */
const archiveMonths = archiveIssuesFixture.reduce<NewsArchiveMonth[]>((months, issue) => {
  const id = monthOf(issue.publishedAt);
  const month = months.find((item) => item.id === id);
  if (month) month.issuesCount += 1;
  else months.push({ id, issuesCount: 1 });
  return months;
}, []);

export const newsHandlers = [
  mockHttp.get("/news/issues/latest", async ({ response }) => {
    await delay();
    return response(200).json(withAssetBase(latestIssueFixture));
  }),

  mockHttp.get("/news/archive", async ({ query, response }) => {
    await delay();
    const requested = query.get("month");
    const month = archiveMonths.some(({ id }) => id === requested) ? requested! : archiveMonths[0].id;
    const rubric = query.get("rubric");
    const issues = archiveIssuesFixture.filter(
      (issue) => monthOf(issue.publishedAt) === month && (!rubric || issue.rubric === rubric)
    );
    return response(200).json(withAssetBase({ months: archiveMonths, month, issues }));
  }),
];
