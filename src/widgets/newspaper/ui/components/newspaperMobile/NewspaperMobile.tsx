import {
  formatAfishaDate,
  formatIssueDateShort,
  formatIssueNumber,
  NEWS_RUBRIC_LABELS,
  type NewsIssue,
} from "@/entities/newsIssue";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { Link } from "react-router";
import { useRubricFilter } from "../../../model/lib/hooks/useRubricFilter";
import IssueNav from "../issueNav/IssueNav";
import PaperSheet from "../paperSheet/PaperSheet";
import RubricNav from "../rubricNav/RubricNav";
import StoryImage from "../storyImage/StoryImage";

/** Кегль заголовка по месту материала в номере: главный крупнее */
const TITLE_SIZES = ["text-[36px]", "text-[30px]", "text-[28px]"];

/** Мобильные: материалы лентой, рубрика фильтрует ленту (MNews) */
const NewspaperMobile: FC<{ issue: NewsIssue }> = ({ issue }) => {
  const { rubric, setRubric, matches } = useRubricFilter();
  const stories = [issue.lead, ...issue.stories].filter((story) => matches(story.rubric));

  return (
    <PaperSheet className="mx-2.5 px-4.5 pt-5.5 pb-6.5 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="flex justify-between text-[10px] tracking-[0.1em] uppercase">
        <span>Выпуск № {formatIssueNumber(issue.number)}</span>
        <time dateTime={issue.publishedAt}>{formatIssueDateShort(issue.publishedAt)}</time>
      </div>
      {/* 46px из макета, но не шире листа: на узких телефонах название остаётся в одну строку */}
      <h1 className="m-0 mt-2 text-center font-paper-display text-[min(46px,calc((100vw-60px)/7.6))] leading-none font-normal whitespace-nowrap">
        Винный Вѣстникъ
      </h1>
      <p className="m-0 mt-1.5 text-center text-[10px] tracking-[0.24em] uppercase">Еженедельная газета бутика</p>

      <RubricNav rubric={rubric} onChange={setRubric} variant="mobile" />

      {stories.map((story, index) => (
        <article key={story.slug} className="border-b border-ink py-4">
          <span className="text-[11px] tracking-[0.22em] uppercase">{story.kicker}</span>
          <h2 className={cn("m-0 mt-1.5 font-paper-display leading-[1.04] font-normal", TITLE_SIZES[Math.min(index, 2)])}>
            <Link to={ROUTES.article(story.slug)} className="text-ink no-underline">
              {story.title}
            </Link>
          </h2>
          {story.image && <StoryImage image={story.image} withCaption={false} className="mt-2.5 h-50" />}
          <p className="m-0 mt-2.5 text-justify text-[17px] leading-[1.55] hyphens-auto">{story.standfirst ?? story.body[0]}</p>
          <Link to={ROUTES.article(story.slug)} className="mt-1.5 inline-block text-[15px] text-primary-500 italic">
            Читать дальше →
          </Link>
        </article>
      ))}
      {stories.length === 0 && rubric !== "all" && (
        <p className="m-0 border-b border-ink py-4 text-[17px] italic">
          В этом номере больших материалов в рубрике «{NEWS_RUBRIC_LABELS[rubric]}» нет — загляните в «Коротко».
        </p>
      )}

      <section className="pt-4 pb-1.5">
        <h3 className="m-0 border-y border-ink text-center font-paper-display text-[28px] font-normal">Коротко</h3>
        <ul className="m-0 mt-2 list-none p-0 text-sm leading-[1.45]">
          {issue.briefs.map((brief) => (
            <li key={brief.title} className="border-b border-dotted border-ink py-2 last:border-b-0">
              {brief.title}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-2.5 border-2 border-ink p-3">
        <h3 className="m-0 text-center font-paper-display text-[26px] font-normal">Афиша погреба</h3>
        {issue.afisha.map((item) => (
          <Link
            key={item.title}
            to={ROUTES.tastings}
            className="grid grid-cols-[70px_1fr] gap-2 border-b border-dotted border-ink py-2 text-[15px] text-ink no-underline last:border-b-0"
          >
            <span className="font-bold">{formatAfishaDate(item.startsAt)}</span>
            <span>{item.title}</span>
          </Link>
        ))}
      </section>

      <IssueNav issue={issue} variant="mobile" />
    </PaperSheet>
  );
};

export default NewspaperMobile;
