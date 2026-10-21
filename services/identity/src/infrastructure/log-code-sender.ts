import { Inject, Injectable, Logger } from "@nestjs/common";
import { SERVICE_CONFIG } from "@wine/service-kit";
import { CodeSender } from "../application/ports.js";
import type { IdentityConfig } from "../config.js";

/**
 * Код — в лог сервиса: SMS-провайдера пока нет (он придёт с сервисом notifications по событию).
 * Для разработки и сквозных тестов: docker compose logs identity | grep "Код входа".
 * С DEMO_CODES=true код ещё и уходит клиенту в ответе — демо на VPS без SMS.
 */
@Injectable()
export class LogCodeSender extends CodeSender {
  private readonly logger = new Logger("PhoneCode");
  readonly revealsCode: boolean;

  constructor(@Inject(SERVICE_CONFIG) config: IdentityConfig) {
    super();
    this.revealsCode = config.DEMO_CODES;
  }

  async send(phone: string, code: string): Promise<void> {
    this.logger.log(`Код входа для ${phone}: ${code}`);
  }
}
