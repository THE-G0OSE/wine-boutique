import type { NewsArticle } from "@/entities/newsArticle";
import { ROUTES } from "@/shared/config/routes";
import type { FC } from "react";
import ArticleText from "../articleText/ArticleText";
import Clipping from "../clipping/Clipping";
import MoreClippings from "../moreClippings/MoreClippings";
import StickyNote from "../stickyNote/StickyNote";

/**
 * Десктоп: вырезка со статьёй на скрепке слева; справа — фото на скотче, стикеры и ещё вырезки.
 * Композиция из артборда Article, но сеткой, а не по координатам: длина статьи бывает разной.
 */
const ArticleDesktop: FC<{ article: NewsArticle }> = ({ article }) => (
  <div className="relative mt-5 grid grid-cols-[minmax(0,1000px)_minmax(360px,560px)] justify-between gap-x-15 pb-24">
    <div className="relative pt-5 pl-7.5">
      <Clipping rotate={-0.8} paddingClassName="px-16 py-14">
        <ArticleText article={article} variant="desktop" />
      </Clipping>
      {/* Скрепка */}
      <span
        aria-hidden="true"
        className="absolute -top-0.5 left-22.5 h-24 w-7.5 rotate-[-6deg] rounded-[15px] border-4 border-metal shadow-[1px_2px_3px_rgba(0,0,0,0.4)]"
      />
    </div>

    <aside className="relative flex flex-col pt-12.5" aria-label="К статье">
      {article.image && (
        <div className="relative">
          <Clipping rotate={3.2}>
            <img
              src={article.image.src}
              alt={article.image.alt}
              className="block aspect-[504/420] w-full border border-ink object-cover mix-blend-multiply"
            />
            {article.image.caption && <p className="m-0 mt-2.5 text-[17px] italic">{article.image.caption}</p>}
          </Clipping>
          {/* Скотч */}
          <span
            aria-hidden="true"
            className="absolute -top-3.5 left-52.5 h-8.5 w-32.5 rotate-[-4deg] bg-[rgba(240,230,200,0.55)] shadow-[0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-[1px]"
          />
        </div>
      )}

      <div className="mt-10 flex items-start gap-7.5 pl-12.5">
        {article.relatedWine && (
          <StickyNote to={ROUTES.wine(article.relatedWine.slug)} tone="yellow" rotate={-3} className="w-75 shrink-0 px-6.5 pt-6.5 pb-5.5">
            <span className="block text-[32px] leading-[1.05]">Забронировать {article.relatedWine.name}</span>
            <span className="mt-2 block text-lg">→ на полку</span>
          </StickyNote>
        )}
        <StickyNote to={ROUTES.tastings} tone="pink" rotate={4} className="mt-17.5 w-57.5 shrink-0 px-5.5 pt-5.5 pb-4.5">
          <span className="block text-[28px] leading-[1.05]">Попробовать на дегустации</span>
        </StickyNote>
      </div>

      <div className="relative mt-14 pl-12.5">
        <MoreClippings clippings={article.more} variant="desktop" />
        {/* След от бокала на столе */}
        <span
          aria-hidden="true"
          className="absolute -bottom-12 left-20 size-45 scale-y-90 rounded-full border-[10px] border-[rgba(110,20,20,0.18)] blur-[1.5px]"
        />
      </div>
    </aside>
  </div>
);

export default ArticleDesktop;
