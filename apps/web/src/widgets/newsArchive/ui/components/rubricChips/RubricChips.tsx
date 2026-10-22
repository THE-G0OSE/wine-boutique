import { NEWS_RUBRIC_LABELS, NEWS_RUBRICS, type NewsRubric } from "@/entities/newsIssue";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { Chip } from "uikit;/";

interface IProps {
  rubric: NewsRubric | undefined;
  onChange: (rubric: NewsRubric | undefined) => void;
  /** Телефон: чипы одной строкой с прокруткой вбок */
  compact?: boolean;
}

const OPTIONS: { value: NewsRubric | undefined; label: string }[] = [
  { value: undefined, label: "Все" },
  ...NEWS_RUBRICS.map((value) => ({ value, label: NEWS_RUBRIC_LABELS[value] })),
];

/** Фильтр подшивки по рубрике */
const RubricChips: FC<IProps> = ({ rubric, onChange, compact = false }) => (
  <div
    role="group"
    aria-label="Рубрики"
    className={cn("flex gap-2.5", {
      "max-w-175 shrink-0 flex-wrap justify-end": !compact,
      "overflow-x-auto overflow-y-hidden px-5 pb-1 [scrollbar-width:none] [&>*]:shrink-0": compact,
    })}
  >
    {OPTIONS.map(({ value, label }) => (
      <Chip
        key={label}
        variant="soft"
        active={rubric === value}
        aria-pressed={rubric === value}
        onClick={() => onChange(value)}
      >
        {label}
      </Chip>
    ))}
  </div>
);

export default RubricChips;
