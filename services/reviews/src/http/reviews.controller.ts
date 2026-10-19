import { Body, Controller, Get, Header, HttpCode, Post, Query } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetReviewsQuery, zGetReviewsResponse, zSendReviewBody } from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, RateLimit, ValidationError } from "@wine/service-kit";
import type { z } from "zod";
import { Letters } from "../application/letters.js";
import { LetterRuleError, type PublishedLetter } from "../domain/letter.js";

const INVALID_LETTER = "Подпишите конверт и напишите хотя бы пару строк";

/** Опубликованное письмо в формате контракта Review */
const toReview = (letter: PublishedLetter): components["schemas"]["Review"] => ({
  id: letter.id,
  topic: letter.topic,
  greeting: letter.greeting,
  text: letter.text,
  postscript: letter.postscript,
  author: letter.authorName,
  city: letter.city,
  signature: letter.signature,
  receivedAt: letter.receivedAt?.toISOString().slice(0, 10) ?? null,
});

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly letters: Letters) {}

  /** GET /api/reviews — operationId getReviews */
  @Get()
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetReviewsResponse)
  async list(@Query({ schema: zGetReviewsQuery }) query: z.output<typeof zGetReviewsQuery>): Promise<components["schemas"]["ReviewPage"]> {
    const page = await this.letters.published(query.limit, query.offset);
    return { items: page.items.map(toReview), total: page.total };
  }

  /** POST /api/reviews — operationId sendReview: письмо уходит сомелье на модерацию (202) */
  @Post()
  @HttpCode(202)
  @RateLimit(5, 60_000)
  @ValidationError("invalid_letter", INVALID_LETTER)
  async send(@Body({ schema: zSendReviewBody }) body: z.output<typeof zSendReviewBody>): Promise<void> {
    try {
      await this.letters.receive(body);
    } catch (error) {
      if (error instanceof LetterRuleError) throw new ApiError(422, error.code, error.message);
      throw error;
    }
  }
}
