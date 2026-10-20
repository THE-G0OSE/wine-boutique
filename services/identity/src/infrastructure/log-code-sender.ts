import { Injectable, Logger } from "@nestjs/common";
import { CodeSender } from "../application/ports.js";

/**
 * Код — в лог сервиса: SMS-провайдера пока нет (он придёт с сервисом notifications по событию).
 * Для разработки и сквозных тестов: docker compose logs identity | grep "Код входа".
 */
@Injectable()
export class LogCodeSender extends CodeSender {
  private readonly logger = new Logger("PhoneCode");

  async send(phone: string, code: string): Promise<void> {
    this.logger.log(`Код входа для ${phone}: ${code}`);
  }
}
