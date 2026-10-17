import type { NewsIssue } from "@/entities/newsIssue";
import { cn } from "@/shared/lib/cn";
import { Fragment, type FC } from "react";

interface IProps {
  issue: NewsIssue;
  /** Подходит ли заметка под выбранную рубрику — неподходящие приглушаются */
  matches: (rubric: NewsIssue["briefs"][number]["rubric"]) => boolean;
}

/** Колонка «Коротко»: заметки, цитата номера и анонс следующего выпуска */
const BriefsColumn: FC<IProps> = ({ issue, matches }) => (
  <aside className="flex flex-col gap-4.5 border-l border-ink pl-7">
    <h3 className="m-0 border-t-4 border-b border-double border-ink py-1 text-center font-paper-display text-[36px] font-normal">
      Коротко
    </h3>
    {issue.briefs.map((brief, index) => (
      <Fragment key={brief.title}>
        {index > 0 && (
          <div aria-hidden="true" className="text-center text-[22px]">
            ❧
          </div>
        )}
        <div className={cn("flex flex-col gap-1.5 transition-opacity duration-300", { "opacity-30": !matches(brief.rubric) })}>
          <h4 className="m-0 text-md leading-[1.25]">{brief.title}</h4>
          <p className="m-0 text-justify text-[17px] leading-[1.55] hyphens-auto">{brief.text}</p>
        </div>
      </Fragment>
    ))}
    <blockquote className="m-0 mt-2.5 border-y border-ink px-4.5 py-5.5 text-center">
      <p className="m-0 text-lg leading-[1.35] italic">{issue.quote.text}</p>
      <p className="m-0 mt-2.5 text-[13px] tracking-[0.2em] uppercase">{issue.quote.author}</p>
    </blockquote>
    <div className="mt-1.5 flex flex-col gap-2 border-[3px] border-double border-ink p-4 text-center">
      <span className="text-[13px] tracking-[0.22em] uppercase">В следующем номере</span>
      <span className="font-paper-display text-[26px] leading-[1.15]">{issue.nextIssueTeaser}</span>
    </div>
  </aside>
);

export default BriefsColumn;
