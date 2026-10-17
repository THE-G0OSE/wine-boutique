import { useGetNewsArticleQuery } from "@/entities/newsArticle";
import { ROUTES } from "@/shared/config/routes";
import { isApiError } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import type { FC } from "react";
import { Link } from "react-router";
import ArticleDesktop from "./components/articleDesktop/ArticleDesktop";
import ArticleMobile from "./components/articleMobile/ArticleMobile";
import Clipping from "./components/clipping/Clipping";

const link = "text-amber-200 no-underline hover:text-paper";

/** Пустая вырезка: пока статья грузится, или если такой нет */
const BlankClipping: FC<{ title: string; text?: string; busy: boolean }> = ({ title, text, busy }) => (
  <Clipping rotate={-0.8} paddingClassName="px-8 py-12 lg:px-16" className="mx-3 mt-6 max-w-250 lg:mx-auto lg:mt-10">
    <div aria-busy={busy} role={busy ? "status" : undefined} className="flex flex-col items-center gap-3 text-center">
      <span className="font-paper-display text-[clamp(32px,4vw,56px)] leading-[1.05]">{title}</span>
      {text && <span className="text-caption italic">{text}</span>}
      {!busy && (
        <span className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 text-caption">
          <Link to={ROUTES.news} className="text-ink">
            Свежий выпуск
          </Link>
          <Link to={ROUTES.newsArchive} className="text-ink">
            Подшивка выпусков
          </Link>
        </span>
      )}
    </div>
  </Clipping>
);

/** Статья «Винного Вѣстника» — вырезка на столе со стикерами и другими вырезками */
const NewsArticle: FC<{ slug: string }> = ({ slug }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { data: article, isLoading, isFetching, error } = useGetNewsArticleQuery(slug);

  let content;
  if (error) {
    content =
      isApiError(error) && error.status === 404 ? (
        <BlankClipping busy={false} title="Такой вырезки в подшивке нет" text="Может быть, статью перенесли или ссылка с опечаткой." />
      ) : (
        <BlankClipping busy={false} title="Вырезка не нашлась" text="Не получилось загрузить статью — обновите страницу." />
      );
  } else if (isLoading || !article) {
    content = <BlankClipping busy title="Достаём вырезку из подшивки…" />;
  } else {
    content = isDesktop ? <ArticleDesktop article={article} /> : <ArticleMobile article={article} />;
  }

  return (
    <div className={cn("transition-opacity duration-200", { "opacity-60": isFetching && !isLoading })}>
      <nav
        aria-label="Газета"
        className="flex justify-between px-5 pt-4 text-[15px] lg:mx-auto lg:max-w-420 lg:px-10 lg:pt-10 lg:text-caption 2xl:px-30"
      >
        <Link to={ROUTES.news} className={link}>
          {isDesktop ? "← К свежему выпуску" : "← К выпуску"}
        </Link>
        <Link to={ROUTES.newsArchive} className={link}>
          {isDesktop ? "Подшивка выпусков →" : "Подшивка →"}
        </Link>
      </nav>
      <div className="lg:mx-auto lg:max-w-420 lg:px-10 2xl:px-30">{content}</div>
    </div>
  );
};

export default NewsArticle;
