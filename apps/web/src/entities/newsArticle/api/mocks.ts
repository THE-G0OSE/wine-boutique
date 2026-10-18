import { delay } from "msw";
import { mockHttp, withAssetBase } from "@/shared/api/mockHttp";
import { NEWS_RUBRIC_LABELS } from "@/entities/newsIssue/@x/newsArticle";
import type { NewsArticle } from "../model/types";
import { archiveIssuesFixture, articleFixtures, moreClippings, rubricImage } from "@wine/demo-data";

/**
 * Статья из подшивки, текста которой в дизайне нет: заголовок и выходные данные — из выпуска,
 * текст — плейсхолдер (не выдумываем).
 */
const archivePlaceholder = (slug: string): NewsArticle | undefined => {
  const issue = archiveIssuesFixture.find((item) => item.articleSlug === slug);
  if (!issue) return undefined;
  return {
    slug,
    rubric: issue.rubric,
    kicker: NEWS_RUBRIC_LABELS[issue.rubric],
    title: issue.title,
    standfirst: null,
    byline: null,
    readingMinutes: null,
    issue: { id: issue.id, number: issue.number, publishedAt: issue.publishedAt },
    image: { src: rubricImage(issue.rubric), alt: "", caption: null },
    body: ["[Текст статьи — его пришлёт редакция]"],
    pullQuote: null,
    relatedWine: null,
    more: moreClippings(slug),
  };
};

export const articleHandlers = [
  mockHttp.get("/news/articles/{slug}", async ({ params, response }) => {
    await delay();
    const article = articleFixtures.find((item) => item.slug === params.slug) ?? archivePlaceholder(params.slug);
    if (!article) return response(404).json({ code: "not_found", message: "Такой вырезки в подшивке нет" });
    return response(200).json(withAssetBase(article));
  }),
];
