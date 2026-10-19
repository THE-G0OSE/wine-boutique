import { Injectable } from "@nestjs/common";
import { MORE_CLIPPINGS, type Archive, type Article, type Clipping, type Issue, type NewsRubric } from "../domain/news.js";
import { NewsRepository, WineCatalog, type WineRef } from "./ports.js";

export interface ArticlePage {
  article: Article;
  relatedWine: WineRef | null;
  more: Clipping[];
}

/** Чтение газеты: свежий номер, статья, подшивка */
@Injectable()
export class ReadNews {
  constructor(
    private readonly news: NewsRepository,
    private readonly wines: WineCatalog
  ) {}

  latestIssue(): Promise<Issue | null> {
    return this.news.latestIssue();
  }

  /** Статья, «Ещё вырезки» и вино для стикера. catalog недоступен — статья всё равно открывается, без вина */
  async article(slug: string): Promise<ArticlePage | null> {
    const article = await this.news.articleBySlug(slug);
    if (!article) return null;
    const [more, wines] = await Promise.all([
      this.news.latestClippings(slug, MORE_CLIPPINGS),
      article.relatedWineId ? this.wines.wineRefs([article.relatedWineId]) : Promise.resolve(new Map<string, WineRef>()),
    ]);
    return { article, more, relatedWine: (article.relatedWineId && wines.get(article.relatedWineId)) || null };
  }

  archive(month: string | undefined, rubric: NewsRubric | undefined): Promise<Archive> {
    return this.news.archive(month, rubric);
  }
}
