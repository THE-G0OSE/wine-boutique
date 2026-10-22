import type { NewsClipping } from "@/entities/newsArticle";
import { NEWS_RUBRIC_LABELS } from "@/entities/newsIssue";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { Link } from "react-router";
import { Newsprint } from "uikit;/";
import { MORE_CLIPPINGS_LAYOUT } from "../../../model/decor";
import Clipping from "../clipping/Clipping";

interface IProps {
  clippings: NewsClipping[];
  variant: "desktop" | "mobile";
}

/** «Ещё вырезки»: на десктопе — разбросаны столбиком, на мобильных — лента */
const MoreClippings: FC<IProps> = ({ clippings, variant }) => {
  if (clippings.length === 0) return null;

  if (variant === "mobile") {
    return (
      <section aria-labelledby="more-clippings" className="relative mt-7.5 mb-10">
        <h2 id="more-clippings" className="m-0 px-5 font-hand text-[28px] font-normal text-paper">
          Ещё вырезки:
        </h2>
        <div className="mt-2.5 flex gap-3.5 overflow-x-auto overflow-y-hidden px-5 pt-1.5 pb-4 [scrollbar-width:none]">
          {clippings.map((clipping) => (
            <Link
              key={clipping.slug}
              to={ROUTES.article(clipping.slug)}
              className="relative w-52.5 shrink-0 overflow-hidden p-4.5 font-paper text-ink no-underline shadow-[0_12px_20px_rgba(0,0,0,0.5)]"
            >
              <Newsprint />
              <span className="relative block text-[11px] tracking-[0.2em] uppercase">{NEWS_RUBRIC_LABELS[clipping.rubric]}</span>
              <span className="relative mt-1 block font-paper-display text-lg leading-[1.05]">{clipping.title}</span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="more-clippings" className="flex flex-col gap-2.5">
      <h2 id="more-clippings" className="m-0 font-hand text-[34px] font-normal text-paper">
        Ещё вырезки:
      </h2>
      <div className="flex flex-col gap-6.5">
        {clippings.map((clipping, index) => {
          const layout = MORE_CLIPPINGS_LAYOUT[index % MORE_CLIPPINGS_LAYOUT.length];
          return (
            <Link
              key={clipping.slug}
              to={ROUTES.article(clipping.slug)}
              className={cn(
                "block w-85 max-w-full text-ink no-underline transition-[translate] duration-200 hover:-translate-y-1",
                layout.offset
              )}
            >
              <Clipping rotate={layout.rotate} paddingClassName="px-7 py-6.5">
                <span className="text-[13px] tracking-[0.22em] uppercase">{NEWS_RUBRIC_LABELS[clipping.rubric]}</span>
                <span className="mt-1.5 block font-paper-display text-xl leading-[1.08]">{clipping.title}</span>
                <span className="mt-2 block text-[15px] italic">читать вырезку →</span>
              </Clipping>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default MoreClippings;
