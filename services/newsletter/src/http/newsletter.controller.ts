import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { zSubscribeNewsletterBody } from "@wine/contracts/openapi/zod";
import { RateLimit, ValidationError } from "@wine/service-kit";
import type { z } from "zod";
import { Subscribe } from "../application/subscribe.js";

@Controller("newsletter")
export class NewsletterController {
  constructor(private readonly subscribe: Subscribe) {}

  /** POST /api/newsletter — operationId subscribeNewsletter: 204 и при первой, и при повторной подписке */
  @Post()
  @HttpCode(204)
  @RateLimit(5, 60_000)
  @ValidationError("invalid_email", "Проверьте адрес — кажется, в нём опечатка")
  async create(@Body({ schema: zSubscribeNewsletterBody }) body: z.output<typeof zSubscribeNewsletterBody>): Promise<void> {
    await this.subscribe.execute(body.email);
  }
}
