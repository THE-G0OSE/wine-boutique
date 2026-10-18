import type { NewsIssue } from "@/entities/newsIssue";
import { CONTACTS } from "@/shared/config/contacts";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { useRubricFilter } from "../../../model/lib/hooks/useRubricFilter";
import IssueNav from "../issueNav/IssueNav";
import PaperSheet from "../paperSheet/PaperSheet";
import RubricNav from "../rubricNav/RubricNav";
import AfishaTable from "./AfishaTable";
import BriefsColumn from "./BriefsColumn";
import LeadStory from "./LeadStory";
import Masthead from "./Masthead";
import SecondPage from "./SecondPage";

/**
 * Десктоп: развёрнутая газета. Вёрстку полосы при выборе рубрики не ломаем —
 * материалы других рубрик приглушаются.
 */
const NewspaperDesktop: FC<{ issue: NewsIssue }> = ({ issue }) => {
  const { rubric, setRubric, matches } = useRubricFilter();

  return (
    <PaperSheet
      folded
      className="mx-auto w-full max-w-350 px-15 pt-12 pb-13 shadow-[0_50px_90px_rgba(0,0,0,0.6),0_6px_14px_rgba(0,0,0,0.4)]"
    >
      <Masthead issue={issue} />
      <RubricNav rubric={rubric} onChange={setRubric} variant="desktop" />

      <div className="mt-6.5 grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className={cn("transition-opacity duration-300", { "opacity-30": !matches(issue.lead.rubric) })}>
          <LeadStory story={issue.lead} />
        </div>
        <BriefsColumn issue={issue} matches={matches} />
      </div>

      <SecondPage stories={issue.stories} ads={issue.ads} matches={matches} />
      <AfishaTable items={issue.afisha} />
      <IssueNav issue={issue} variant="desktop" />
      <p className="m-0 mt-2.5 text-center text-[13px] tracking-[0.1em]">
        Издаётся бутиком Premium Wine Boutique · Редакция: {CONTACTS.email} · Отпечатано в погребе
      </p>
    </PaperSheet>
  );
};

export default NewspaperDesktop;
