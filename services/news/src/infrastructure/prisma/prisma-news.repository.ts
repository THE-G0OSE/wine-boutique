import { Injectable } from "@nestjs/common";
import { NewsRepository } from "../../application/ports.js";
import type { Archive, Article, Clipping, Issue, NewsImage, NewsRubric, Story } from "../../domain/news.js";
import type { Prisma } from "./generated/client.js";
import { NewsPrisma } from "./news-prisma.js";

/** Колонка date хранит полночь UTC → «2026-10-16» */
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const isoDateTime = (date: Date | null) => (date === null ? null : date.toISOString());

const image = (src: string | null, alt: string | null, caption: string | null): NewsImage | null =>
  src === null ? null : { src, alt: alt ?? "", caption };

type StoryRow = Prisma.IssueStoryGetPayload<{ include: { article: { select: { slug: true } } } }>;

const toStory = (row: StoryRow): Story => ({
  slug: row.article.slug,
  rubric: row.rubric,
  kicker: row.kicker,
  title: row.title,
  standfirst: row.standfirst,
  byline: row.byline,
  readingMinutes: row.readingMinutes,
  image: image(row.imageSrc, row.imageAlt, row.imageCaption),
  body: row.body,
  event: row.hasEvent ? { startsAt: isoDateTime(row.eventStartsAt), seats: row.eventSeats } : null,
});

/** Полоса полного номера: эти поля должны быть заполнены, иначе выпуск — только из подшивки */
const FULL_ISSUE: Prisma.IssueWhereInput = {
  city: { not: null },
  weather: { not: null },
  quoteText: { not: null },
  quoteAuthor: { not: null },
  nextIssueTeaser: { not: null },
  stories: { some: { placement: "lead" } },
};

@Injectable()
export class PrismaNewsRepository extends NewsRepository {
  constructor(private readonly prisma: NewsPrisma) {
    super();
  }

  async latestIssue(): Promise<Issue | null> {
    const row = await this.prisma.issue.findFirst({
      where: FULL_ISSUE,
      orderBy: { publishedAt: "desc" },
      include: {
        stories: { include: { article: { select: { slug: true } } } },
        briefs: { orderBy: { position: "asc" } },
        ads: { orderBy: { position: "asc" } },
        afisha: { orderBy: { position: "asc" } },
      },
    });
    if (!row) return null;
    const lead = row.stories.find((story) => story.placement === "lead");
    if (!lead) return null;
    const [previous, next] = await Promise.all([
      this.prisma.issue.findFirst({ where: { publishedAt: { lt: row.publishedAt } }, orderBy: { publishedAt: "desc" }, select: { id: true } }),
      this.prisma.issue.findFirst({ where: { publishedAt: { gt: row.publishedAt } }, orderBy: { publishedAt: "asc" }, select: { id: true } }),
    ]);
    const second = (["second_wide", "second_column"] as const).flatMap((placement) =>
      row.stories.filter((story) => story.placement === placement)
    );
    return {
      id: row.id,
      number: row.number,
      publishedAt: isoDate(row.publishedAt),
      city: row.city!,
      weather: row.weather!,
      lead: toStory(lead),
      stories: second.map(toStory),
      briefs: row.briefs.map(({ rubric, title, text }) => ({ rubric, title, text })),
      quote: { text: row.quoteText!, author: row.quoteAuthor! },
      nextIssueTeaser: row.nextIssueTeaser!,
      ads: row.ads.map(({ kicker, title, text, image: adImage, emphasis }) => ({ kicker, title, text, image: adImage, emphasis })),
      afisha: row.afisha.map(({ startsAt, title, format, capacityLimited, seats }) => ({
        startsAt: isoDateTime(startsAt),
        title,
        format,
        capacityLimited,
        seats,
      })),
      previousIssueId: previous?.id ?? null,
      nextIssueId: next?.id ?? null,
    };
  }

  async articleBySlug(slug: string): Promise<Article | null> {
    const row = await this.prisma.article.findUnique({ where: { slug }, include: { issue: true } });
    if (!row) return null;
    return {
      slug: row.slug,
      rubric: row.rubric,
      kicker: row.kicker,
      title: row.title,
      standfirst: row.standfirst,
      byline: row.byline,
      readingMinutes: row.readingMinutes,
      issue: { id: row.issue.id, number: row.issue.number, publishedAt: isoDate(row.issue.publishedAt) },
      image: image(row.imageSrc, row.imageAlt, row.imageCaption),
      body: row.body,
      pullQuote:
        row.pullQuoteText !== null && row.pullQuoteAfterParagraph !== null
          ? { text: row.pullQuoteText, afterParagraph: row.pullQuoteAfterParagraph }
          : null,
      relatedWineId: row.relatedWineId,
    };
  }

  async latestClippings(excludeSlug: string, limit: number): Promise<Clipping[]> {
    return this.prisma.article.findMany({
      where: { textPending: false, slug: { not: excludeSlug } },
      orderBy: [{ issue: { publishedAt: "desc" } }, { position: "asc" }],
      take: limit,
      select: { slug: true, rubric: true, title: true },
    });
  }

  async archive(month: string | undefined, rubric: NewsRubric | undefined): Promise<Archive> {
    // Выпуски выходят раз в неделю — даты всех номеров помещаются в один небольшой запрос
    const dates = await this.prisma.issue.findMany({ orderBy: { publishedAt: "desc" }, select: { publishedAt: true } });
    const months: Archive["months"] = [];
    for (const { publishedAt } of dates) {
      const id = isoDate(publishedAt).slice(0, 7);
      const last = months.at(-1);
      if (last?.id === id) last.issuesCount += 1;
      else months.push({ id, issuesCount: 1 });
    }
    const shown = months.find((item) => item.id === month)?.id ?? months[0]?.id;
    if (!shown) return { months, month: month ?? isoDate(new Date()).slice(0, 7), issues: [] };

    const [year, mon] = shown.split("-").map(Number);
    const rows = await this.prisma.issue.findMany({
      where: {
        publishedAt: { gte: new Date(Date.UTC(year, mon - 1, 1)), lt: new Date(Date.UTC(year, mon, 1)) },
        frontArticleId: { not: null },
        ...(rubric ? { frontRubric: rubric } : {}),
      },
      orderBy: { publishedAt: "desc" },
      include: { frontArticle: { select: { slug: true } } },
    });
    return {
      months,
      month: shown,
      issues: rows.map((row) => ({
        id: row.id,
        number: row.number,
        publishedAt: isoDate(row.publishedAt),
        rubric: row.frontRubric,
        title: row.frontTitle,
        image: row.frontImage,
        articleSlug: row.frontArticle!.slug,
      })),
    };
  }
}
