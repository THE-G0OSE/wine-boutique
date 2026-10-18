import { cn } from "@/shared/lib/cn";
import type { FC } from "react";

interface IProps {
  paragraphs: string[];
  /** Сколько газетных колонок на широком экране */
  columns: 2 | 3;
  className?: string;
}

/** Текст статьи на полосе: колонки с линейкой, выключка по ширине, буквица в первом абзаце */
const StoryBody: FC<IProps> = ({ paragraphs, columns, className }) => (
  <div
    className={cn(
      "gap-7 text-justify text-[19px] leading-[1.6] hyphens-auto [column-rule:1px_solid_var(--color-ink)]",
      columns === 3 ? "columns-2 xl:columns-3" : "columns-2",
      className
    )}
  >
    {paragraphs.map((paragraph, index) => (
      <p
        key={index}
        className={cn(
          "m-0 mb-3 last:mb-0",
          index === 0 &&
            "first-letter:float-left first-letter:mt-1.5 first-letter:mr-2 first-letter:font-paper-display first-letter:text-[82px] first-letter:leading-[0.8]"
        )}
      >
        {paragraph}
      </p>
    ))}
  </div>
);

export default StoryBody;
