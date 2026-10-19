import type { Archive, Article, Clipping, Issue, NewsRubric } from "../domain/news.js";

/** Хранилище газеты — порт: сценарии не знают про Prisma */
export abstract class NewsRepository {
  /** Самый свежий полный номер (у выпусков только из подшивки полосы нет); null — номеров ещё нет */
  abstract latestIssue(): Promise<Issue | null>;
  abstract articleBySlug(slug: string): Promise<Article | null>;
  /** Свежие статьи с текстом (не заглушки), кроме указанной */
  abstract latestClippings(excludeSlug: string, limit: number): Promise<Clipping[]>;
  /** Подшивка: месяц по умолчанию и неизвестный месяц — самый свежий */
  abstract archive(month: string | undefined, rubric: NewsRubric | undefined): Promise<Archive>;
}

/** Вино для стикера «Забронировать» */
export interface WineRef {
  slug: string;
  name: string;
}

/**
 * Каталог вин — другой сервис (gRPC catalog). Реализация обязана не падать при его отказе:
 * вернуть пустой результат и записать предупреждение — статья откроется без стикера.
 */
export abstract class WineCatalog {
  abstract wineRefs(ids: string[]): Promise<Map<string, WineRef>>;
}
