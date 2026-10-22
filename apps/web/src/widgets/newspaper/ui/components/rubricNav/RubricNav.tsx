import { NEWS_RUBRIC_LABELS, NEWS_RUBRICS } from "@/entities/newsIssue";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { Link } from "react-router";
import type { RubricFilter } from "../../../model/lib/hooks/useRubricFilter";

interface IProps {
  rubric: RubricFilter;
  onChange: (rubric: RubricFilter) => void;
  variant: "desktop" | "mobile";
}

const OPTIONS: { id: RubricFilter; label: string }[] = [
  { id: "all", label: "Все" },
  ...NEWS_RUBRICS.map((id) => ({ id, label: NEWS_RUBRIC_LABELS[id] })),
];

/** Рубрики газеты: на десктопе — строка под датой, «Архив» ведёт в подшивку; на мобильных — лента-переключатель */
const RubricNav: FC<IProps> = ({ rubric, onChange, variant }) => {
  const isDesktop = variant === "desktop";
  const item = isDesktop
    ? "min-h-11 px-4 text-[15px] tracking-[0.18em] uppercase decoration-2 underline-offset-6 hover:underline"
    : "h-8 shrink-0 border px-2.5 text-[13px] tracking-[0.1em] uppercase";

  return (
    <nav
      aria-label="Рубрики"
      className={cn(
        "flex",
        isDesktop
          ? "flex-wrap justify-center gap-2 border-b border-ink py-1.5"
          : "mt-3 gap-1.5 overflow-x-auto overflow-y-hidden border-t-4 border-b border-double border-ink py-1.5 [scrollbar-width:none]"
      )}
    >
      {OPTIONS.map(({ id, label }) => {
        const isActive = rubric === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            className={cn(
              "cursor-pointer bg-transparent font-paper text-ink",
              item,
              isDesktop
                ? cn("border-0", isActive ? "font-bold underline" : "font-normal")
                : isActive
                  ? "border-ink bg-ink text-paper"
                  : "border-transparent"
            )}
          >
            {label}
          </button>
        );
      })}
      {isDesktop && (
        <Link to={ROUTES.newsArchive} className={cn("flex items-center text-ink no-underline", item)}>
          Архив
        </Link>
      )}
    </nav>
  );
};

export default RubricNav;
