import { archiveIssuesFixture, articleFixtures, latestIssueFixture, rubricImage, type NewsRubric } from "@wine/demo-data";
import type { PrismaClient } from "./generated/client.js";

/** Надзаголовок статьи-заглушки — название рубрики, как в мок-обработчике фронта */
const RUBRIC_LABELS: Record<NewsRubric, string> = {
  supply: "Поставки",
  harvest: "Урожай",
  tasting: "Дегустации",
  events: "События",
};

/** Текста статьи нет в дизайне — плейсхолдер из макета, не выдумываем */
const PENDING_BODY = ["[Текст статьи — его пришлёт редакция]"];

const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const asDateTime = (iso: string | null) => (iso === null ? null : new Date(iso));

/** slug вина → id в catalog (gRPC ResolveWineSlugs); недоступен catalog — пустая карта, вино у статьи не проставится */
export type ResolveWineSlugs = (slugs: string[]) => Promise<Map<string, string>>;

/**
 * Газета из @wine/demo-data — те же данные, что отдают моки фронта.
 * Повторный запуск безопасен: выпуски обновляются по дате, статьи — по slug, полосы пересобираются.
 */
export const seedNews = async (prisma: PrismaClient, resolveWineSlugs: ResolveWineSlugs) => {
  const wineSlugs = articleFixtures.flatMap((article) => (article.relatedWine ? [article.relatedWine.slug] : []));
  const wineIds = await resolveWineSlugs(wineSlugs);

  // Выпуски: из подшивки — первая полоса; свежий — ещё и полный номер
  const issueIds = new Map<string, string>();
  for (const card of archiveIssuesFixture) {
    const full = card.publishedAt === latestIssueFixture.publishedAt ? latestIssueFixture : null;
    const data = {
      number: card.number,
      frontRubric: card.rubric,
      frontTitle: card.title,
      frontImage: card.image,
      city: full?.city ?? null,
      weather: full?.weather ?? null,
      quoteText: full?.quote.text ?? null,
      quoteAuthor: full?.quote.author ?? null,
      nextIssueTeaser: full?.nextIssueTeaser ?? null,
    };
    const issue = await prisma.issue.upsert({
      where: { publishedAt: asDate(card.publishedAt) },
      create: { publishedAt: asDate(card.publishedAt), ...data },
      update: data,
    });
    issueIds.set(card.publishedAt, issue.id);
  }

  // Статьи: с текстом из дизайна + заглушки для первых полос, текста которых нет
  const articles = [
    ...articleFixtures.map((article) => ({
      slug: article.slug,
      publishedAt: article.issue.publishedAt,
      rubric: article.rubric,
      kicker: article.kicker,
      title: article.title,
      standfirst: article.standfirst,
      byline: article.byline,
      readingMinutes: article.readingMinutes,
      imageSrc: article.image?.src ?? null,
      imageAlt: article.image?.alt ?? null,
      imageCaption: article.image?.caption ?? null,
      body: article.body,
      pullQuoteText: article.pullQuote?.text ?? null,
      pullQuoteAfterParagraph: article.pullQuote?.afterParagraph ?? null,
      relatedWineId: article.relatedWine ? (wineIds.get(article.relatedWine.slug) ?? null) : null,
      textPending: false,
    })),
    ...archiveIssuesFixture
      .filter((card) => !articleFixtures.some((article) => article.slug === card.articleSlug))
      .map((card) => ({
        slug: card.articleSlug,
        publishedAt: card.publishedAt,
        rubric: card.rubric,
        kicker: RUBRIC_LABELS[card.rubric],
        title: card.title,
        standfirst: null,
        byline: null,
        readingMinutes: null,
        imageSrc: rubricImage(card.rubric),
        imageAlt: "",
        imageCaption: null,
        body: PENDING_BODY,
        pullQuoteText: null,
        pullQuoteAfterParagraph: null,
        relatedWineId: null,
        textPending: true,
      })),
  ];

  const articleIds = new Map<string, string>();
  const positions = new Map<string, number>();
  for (const { publishedAt, ...article } of articles) {
    const issueId = issueIds.get(publishedAt);
    if (!issueId) throw new Error(`Статья ${article.slug} ссылается на выпуск ${publishedAt}, которого нет в подшивке`);
    const position = positions.get(issueId) ?? 0;
    positions.set(issueId, position + 1);
    const data = { ...article, issueId, position };
    const saved = await prisma.article.upsert({ where: { slug: article.slug }, create: data, update: data });
    articleIds.set(article.slug, saved.id);
  }

  for (const card of archiveIssuesFixture) {
    await prisma.issue.update({
      where: { id: issueIds.get(card.publishedAt)! },
      data: { frontArticleId: articleIds.get(card.articleSlug) ?? null },
    });
  }

  // Полосы свежего номера
  const issueId = issueIds.get(latestIssueFixture.publishedAt)!;
  const placements = [
    ["lead", latestIssueFixture.lead],
    ["second_wide", latestIssueFixture.stories[0]],
    ["second_column", latestIssueFixture.stories[1]],
  ] as const;
  await prisma.$transaction([
    prisma.issueStory.deleteMany({ where: { issueId } }),
    prisma.brief.deleteMany({ where: { issueId } }),
    prisma.ad.deleteMany({ where: { issueId } }),
    prisma.afishaItem.deleteMany({ where: { issueId } }),
    prisma.issueStory.createMany({
      data: placements.flatMap(([placement, story]) => {
        const articleId = story && articleIds.get(story.slug);
        if (!story || !articleId) return [];
        return [
          {
            issueId,
            articleId,
            placement,
            rubric: story.rubric,
            kicker: story.kicker,
            title: story.title,
            standfirst: story.standfirst,
            byline: story.byline,
            readingMinutes: story.readingMinutes,
            imageSrc: story.image?.src ?? null,
            imageAlt: story.image?.alt ?? null,
            imageCaption: story.image?.caption ?? null,
            body: story.body,
            hasEvent: story.event !== null,
            eventStartsAt: asDateTime(story.event?.startsAt ?? null),
            eventSeats: story.event?.seats ?? null,
          },
        ];
      }),
    }),
    prisma.brief.createMany({ data: latestIssueFixture.briefs.map((brief, position) => ({ issueId, position, ...brief })) }),
    prisma.ad.createMany({ data: latestIssueFixture.ads.map((ad, position) => ({ issueId, position, ...ad })) }),
    prisma.afishaItem.createMany({
      data: latestIssueFixture.afisha.map((item, position) => ({ issueId, position, ...item, startsAt: asDateTime(item.startsAt) })),
    }),
  ]);

  return { issues: issueIds.size, articles: articleIds.size, linkedWines: wineIds.size };
};
