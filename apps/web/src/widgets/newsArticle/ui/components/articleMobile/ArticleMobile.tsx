import type { NewsArticle } from "@/entities/newsArticle";
import { ROUTES } from "@/shared/config/routes";
import type { FC } from "react";
import ArticleText from "../articleText/ArticleText";
import Clipping from "../clipping/Clipping";
import MoreClippings from "../moreClippings/MoreClippings";
import StickyNote from "../stickyNote/StickyNote";

/** Мобильные (MArticle): вырезка, фото на скотче, два стикера и лента «Ещё вырезки» */
const ArticleMobile: FC<{ article: NewsArticle }> = ({ article }) => (
  <>
    <div className="relative mx-6 mt-5.5">
      <Clipping rotate={-0.6} paddingClassName="px-5 py-7" className="[filter:drop-shadow(0_20px_26px_rgba(0,0,0,0.55))]">
        <ArticleText article={article} variant="mobile" />
      </Clipping>
      <span
        aria-hidden="true"
        className="absolute -top-4 left-7.5 h-18 w-5.5 rotate-[-6deg] rounded-[11px] border-3 border-metal"
      />
    </div>

    {article.image && (
      <div className="relative mx-7.5 mt-6.5">
        <Clipping rotate={2.4} paddingClassName="p-4" className="[filter:drop-shadow(0_18px_22px_rgba(0,0,0,0.55))]">
          <img src={article.image.src} alt={article.image.alt} className="block h-55 w-full border border-ink object-cover mix-blend-multiply" />
        </Clipping>
        <span aria-hidden="true" className="absolute -top-2.5 left-1/2 -ml-12.5 h-6.5 w-25 rotate-[-4deg] bg-[rgba(240,230,200,0.6)]" />
      </div>
    )}

    <div className="relative mx-5 mt-6.5 grid grid-cols-2 gap-3.5">
      {article.relatedWine && (
        <StickyNote to={ROUTES.wine(article.relatedWine.slug)} tone="yellow" rotate={-2} className="p-4 text-lg leading-[1.05]">
          Забронировать {article.relatedWine.name} →
        </StickyNote>
      )}
      <StickyNote to={ROUTES.tastings} tone="pink" rotate={2} className="p-4 text-lg leading-[1.05]">
        Попробовать на дегустации
      </StickyNote>
    </div>

    <MoreClippings clippings={article.more} variant="mobile" />
  </>
);

export default ArticleMobile;
