export type NewsRubric = "supply" | "harvest" | "tasting" | "events";

export interface NewsImage {
  src: string;
  alt: string;
  caption: string | null;
}

/** Выходные данные выпуска, в котором вышла статья */
export interface IssueRef {
  id: string;
  number: number | null;
  /** YYYY-MM-DD */
  publishedAt: string;
}

/** Статья целиком — страница /news/{slug} */
export interface Article {
  slug: string;
  rubric: NewsRubric;
  kicker: string;
  title: string;
  standfirst: string | null;
  byline: string | null;
  readingMinutes: number | null;
  issue: IssueRef;
  image: NewsImage | null;
  body: string[];
  pullQuote: { text: string; afterParagraph: number } | null;
  /** id вина в catalog; имя и slug дочитываются у catalog */
  relatedWineId: string | null;
}

/** Короткая ссылка на статью — «Ещё вырезки» */
export interface Clipping {
  slug: string;
  rubric: NewsRubric;
  title: string;
}

/** Материал на полосе: сокращённая версия статьи */
export interface Story {
  slug: string;
  rubric: NewsRubric;
  kicker: string;
  title: string;
  standfirst: string | null;
  byline: string | null;
  readingMinutes: number | null;
  image: NewsImage | null;
  body: string[];
  /** null — не анонс; у анонса дата и места могут быть ещё не назначены */
  event: { startsAt: string | null; seats: number | null } | null;
}

/** Полный номер газеты — свежий выпуск */
export interface Issue extends IssueRef {
  city: string;
  weather: string;
  lead: Story;
  /** Вторая полоса по порядку: широкий материал, затем колонка */
  stories: Story[];
  briefs: { rubric: NewsRubric; title: string; text: string }[];
  quote: { text: string; author: string };
  nextIssueTeaser: string;
  ads: { kicker: string | null; title: string; text: string; image: string | null; emphasis: boolean }[];
  afisha: { startsAt: string | null; title: string; format: string; capacityLimited: boolean; seats: number | null }[];
  previousIssueId: string | null;
  nextIssueId: string | null;
}

/** Первая полоса выпуска в подшивке */
export interface ArchiveIssue extends IssueRef {
  rubric: NewsRubric;
  title: string;
  image: string;
  articleSlug: string;
}

export interface Archive {
  /** Месяцы от свежего к старому; счётчик — без учёта фильтра по рубрике */
  months: { id: string; issuesCount: number }[];
  /** Показанный месяц YYYY-MM */
  month: string;
  issues: ArchiveIssue[];
}

/** Сколько статей в «Ещё вырезки» */
export const MORE_CLIPPINGS = 3;
