import type { NewsArticle } from "@/entities/newsArticle";
import { formatIssueDateNumeric, formatIssueDateShort, formatIssueNumber } from "@/entities/newsIssue";
import { cn } from "@/shared/lib/cn";
import { plural } from "@/shared/lib/plural";
import { Fragment, type FC } from "react";

interface IProps {
  article: NewsArticle;
  variant: "desktop" | "mobile";
}

const sizes = {
  desktop: {
    top: "pb-2 text-micro tracking-[0.18em]",
    kicker: "mt-5.5 text-[15px] tracking-[0.26em]",
    title: "mt-2.5 text-[clamp(48px,4.4vw,84px)] leading-[1.02]",
    standfirst: "mt-4.5 text-[26px] leading-[1.4]",
    byline: "mt-4.5 py-2 text-micro tracking-[0.16em]",
    body: "mt-6 gap-10 text-[21px] leading-[1.65] columns-1 xl:columns-2",
    paragraph: "mb-3.5",
    dropCap: "first-letter:mt-2 first-letter:mr-2.5 first-letter:text-[96px]",
    quote: "mt-2 mb-4.5 py-3.5 text-[34px]",
  },
  mobile: {
    top: "pb-1.5 text-[10px] tracking-[0.14em]",
    kicker: "mt-3.5 text-[11px] tracking-[0.22em]",
    title: "mt-1.5 text-[40px] leading-[1.04]",
    standfirst: "mt-3 text-caption leading-[1.45]",
    byline: "mt-3 py-1.5 text-[11px] tracking-[0.12em]",
    body: "mt-3.5 text-[17px] leading-[1.6]",
    paragraph: "mb-3",
    dropCap: "first-letter:mt-1.5 first-letter:mr-2 first-letter:text-[70px]",
    quote: "my-3.5 py-2.5 text-[26px]",
  },
};

/** Текст статьи на вырезке: выходные данные, заголовок, лид, колонки с буквицей и вынесенной цитатой */
const ArticleText: FC<IProps> = ({ article, variant }) => {
  const s = sizes[variant];
  const isDesktop = variant === "desktop";
  const { issue, pullQuote } = article;

  return (
    <>
      <div className={cn("flex justify-between gap-4 border-b-4 border-double border-ink uppercase", s.top)}>
        <span>Винный Вѣстникъ{isDesktop && ` · № ${formatIssueNumber(issue.number)}`}</span>
        <time dateTime={issue.publishedAt}>
          {isDesktop ? formatIssueDateShort(issue.publishedAt) : formatIssueDateNumeric(issue.publishedAt)}
        </time>
      </div>
      <span className={cn("block uppercase", s.kicker)}>{article.kicker}</span>
      <h1 className={cn("m-0 font-paper-display font-normal", s.title)}>{article.title}</h1>
      {article.standfirst && <p className={cn("m-0 italic", s.standfirst)}>{article.standfirst}</p>}
      {(article.byline || article.readingMinutes) && (
        <div className={cn("flex justify-between gap-4 border-y border-ink uppercase", s.byline)}>
          <span>{article.byline}</span>
          {article.readingMinutes && (
            <span className="shrink-0 whitespace-nowrap">
              {isDesktop && "Чтение — "}
              {article.readingMinutes} {plural(article.readingMinutes, ["минута", "минуты", "минут"])}
            </span>
          )}
        </div>
      )}

      <div className={cn("text-justify hyphens-auto [column-rule:1px_solid_var(--color-ink)]", s.body)}>
        {article.body.map((paragraph, index) => (
          <Fragment key={index}>
            <p
              className={cn(
                "m-0 last:mb-0",
                s.paragraph,
                index === 0 &&
                  // leading — после размера: tailwind-merge выкидывает leading, стоящий перед text-*
                  cn("first-letter:float-left first-letter:font-paper-display", s.dropCap, "first-letter:leading-[0.8]")
              )}
            >
              {paragraph}
            </p>
            {pullQuote && pullQuote.afterParagraph === index + 1 && (
              <blockquote
                className={cn(
                  "border-y-2 border-ink text-center font-paper-display break-inside-avoid",
                  s.quote,
                  "leading-[1.15]"
                )}
              >
                {pullQuote.text}
              </blockquote>
            )}
          </Fragment>
        ))}
      </div>

      {isDesktop && (
        <div aria-hidden="true" className="mt-5.5 border-t-4 border-double border-ink pt-2.5 text-center text-[15px] tracking-[0.3em]">
          ✦ ✦ ✦
        </div>
      )}
    </>
  );
};

export default ArticleText;
