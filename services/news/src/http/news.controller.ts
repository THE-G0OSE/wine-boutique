import { Controller, Get, Header, Param, Query } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import {
  zGetLatestNewsIssueResponse,
  zGetNewsArchiveQuery,
  zGetNewsArchiveResponse,
  zGetNewsArticlePath,
  zGetNewsArticleResponse,
} from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse } from "@wine/service-kit";
import type { z } from "zod";
import { ReadNews } from "../application/read-news.js";

type Schemas = components["schemas"];

/** Газета «Винный Вѣстникъ». Контент меняется раз в неделю — короткий публичный кэш */
@Controller("news")
export class NewsController {
  constructor(private readonly readNews: ReadNews) {}

  /** GET /api/news/issues/latest — operationId getLatestNewsIssue */
  @Get("issues/latest")
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetLatestNewsIssueResponse)
  async latest(): Promise<Schemas["NewsIssue"]> {
    const issue = await this.readNews.latestIssue();
    if (!issue) throw new ApiError(404, "not_found", "Свежий номер ещё не вышел");
    return issue;
  }

  /** GET /api/news/articles/{slug} — operationId getNewsArticle */
  @Get("articles/:slug")
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetNewsArticleResponse)
  async article(@Param({ schema: zGetNewsArticlePath }) { slug }: z.output<typeof zGetNewsArticlePath>): Promise<Schemas["NewsArticle"]> {
    const page = await this.readNews.article(slug);
    if (!page) throw new ApiError(404, "not_found", "Такой вырезки в подшивке нет");
    const { relatedWineId: _wineId, ...article } = page.article;
    return { ...article, relatedWine: page.relatedWine, more: page.more };
  }

  /** GET /api/news/archive — operationId getNewsArchive */
  @Get("archive")
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetNewsArchiveResponse)
  archive(@Query({ schema: zGetNewsArchiveQuery }) query: z.output<typeof zGetNewsArchiveQuery>): Promise<Schemas["NewsArchive"]> {
    return this.readNews.archive(query.month, query.rubric);
  }
}
