import { NEWS_RUBRIC_LABELS, NEWS_RUBRICS, type NewsRubric } from "@/entities/newsIssue";
import type { FC } from "react";
import { Chip } from "uikit;/";

interface IProps {
  rubric: NewsRubric | undefined;
  onChange: (rubric: NewsRubric | undefined) => void;
}

const OPTIONS: { value: NewsRubric | undefined; label: string }[] = [
  { value: undefined, label: "Все" },
  ...NEWS_RUBRICS.map((value) => ({ value, label: NEWS_RUBRIC_LABELS[value] })),
];

/** Фильтр подшивки по рубрике — только на десктопе (в MArchive его нет) */
const RubricChips: FC<IProps> = ({ rubric, onChange }) => (
  <div role="group" aria-label="Рубрики" className="flex max-w-175 shrink-0 flex-wrap justify-end gap-2.5">
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
