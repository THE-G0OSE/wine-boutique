import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { cellarToday, isTastingKind, shiftMonth, type TastingKind } from "@/entities/tasting";

/** Сколько месяцев афиши можно листать, считая текущий (как TASTING_MONTHS у сервиса) */
const MONTHS_AHEAD = 3;

/**
 * Состояние календаря — в URL: `?month=2026-11&day=2026-11-06&hide=dinner`.
 * Месяц вне афиши (прошлый, слишком далёкий, мусор) — текущий; день из другого месяца — не выбран.
 */
export const useCalendarParams = () => {
  const [params, setParams] = useSearchParams();
  const today = cellarToday();
  const months = useMemo(() => Array.from({ length: MONTHS_AHEAD }, (_, index) => shiftMonth(today.slice(0, 7), index)), [today]);

  const rawMonth = params.get("month") ?? "";
  const month = months.includes(rawMonth) ? rawMonth : months[0];
  const rawDay = params.get("day") ?? "";
  const day = /^\d{4}-\d{2}-\d{2}$/.test(rawDay) && rawDay.startsWith(`${month}-`) ? rawDay : null;
  const hiddenKey = params.getAll("hide").join(",");
  const hidden = useMemo(() => hiddenKey.split(",").filter(isTastingKind), [hiddenKey]);

  const update = useCallback(
    (change: (next: URLSearchParams) => void) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          change(next);
          return next;
        },
        { replace: true, preventScrollReset: true }
      ),
    [setParams]
  );

  const setMonth = useCallback(
    (value: string) =>
      update((next) => {
        if (value === months[0]) next.delete("month");
        else next.set("month", value);
        next.delete("day");
      }),
    [months, update]
  );
  const setDay = useCallback((value: string) => update((next) => next.set("day", value)), [update]);
  const toggleKind = useCallback(
    (kind: TastingKind) =>
      update((next) => {
        next.delete("hide");
        const rest = hidden.includes(kind) ? hidden.filter((item) => item !== kind) : [...hidden, kind];
        for (const item of rest) next.append("hide", item);
      }),
    [hidden, update]
  );

  return { today, month, months, day, hidden, setMonth, setDay, toggleKind };
};
