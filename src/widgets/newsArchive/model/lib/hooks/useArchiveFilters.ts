import { isNewsRubric, type NewsRubric } from "@/entities/newsIssue";
import { useSearchParams } from "react-router";

const MONTH_RE = /^\d{4}-\d{2}$/;

/** Месяц и рубрика подшивки — в URL (?month=2026-09&rubric=tasting) */
export const useArchiveFilters = () => {
  const [params, setParams] = useSearchParams();
  const rawMonth = params.get("month");
  const rawRubric = params.get("rubric");
  const month = rawMonth && MONTH_RE.test(rawMonth) ? rawMonth : undefined;
  const rubric: NewsRubric | undefined = isNewsRubric(rawRubric) ? rawRubric : undefined;

  const update = (key: "month" | "rubric", value: string | undefined) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true }
    );

  return {
    month,
    rubric,
    setMonth: (value: string) => update("month", value),
    setRubric: (value: NewsRubric | undefined) => update("rubric", value),
  };
};
