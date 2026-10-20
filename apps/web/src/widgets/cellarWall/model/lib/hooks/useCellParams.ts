import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { isCellarTerm, type CellarTerm } from "@/entities/cellarCell";

const DEFAULT_TERM: CellarTerm = "1y";

/** Выбранная ячейка и срок — в URL (`?cell=204&term=3y`): ссылкой можно поделиться */
export const useCellParams = () => {
  const [params, setParams] = useSearchParams();
  const cell = params.get("cell");
  const rawTerm = params.get("term") ?? "";
  const term = isCellarTerm(rawTerm) ? rawTerm : DEFAULT_TERM;

  const set = useCallback(
    (key: "cell" | "term", value: string) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(key, value);
          return next;
        },
        { replace: true, preventScrollReset: true }
      ),
    [setParams]
  );

  return {
    cell,
    term,
    setCell: useCallback((value: string) => set("cell", value), [set]),
    setTerm: useCallback((value: CellarTerm) => set("term", value), [set]),
  };
};
