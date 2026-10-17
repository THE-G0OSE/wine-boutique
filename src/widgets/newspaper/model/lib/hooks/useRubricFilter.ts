import { isNewsRubric, type NewsRubric } from "@/entities/newsIssue";
import { useSearchParams } from "react-router";

export type RubricFilter = NewsRubric | "all";

/** Выбранная рубрика газеты живёт в URL (?rubric=harvest): ссылкой можно поделиться, F5 её не сбрасывает */
export const useRubricFilter = () => {
  const [params, setParams] = useSearchParams();
  const raw = params.get("rubric");
  const rubric: RubricFilter = isNewsRubric(raw) ? raw : "all";

  const setRubric = (next: RubricFilter) =>
    setParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        if (next === "all") nextParams.delete("rubric");
        else nextParams.set("rubric", next);
        return nextParams;
      },
      { replace: true, preventScrollReset: true }
    );

  const matches = (storyRubric: NewsRubric) => rubric === "all" || rubric === storyRubric;

  return { rubric, setRubric, matches };
};
