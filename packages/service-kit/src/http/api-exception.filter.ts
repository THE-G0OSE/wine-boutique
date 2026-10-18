import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger, type ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import type { ApiErrorBody } from "./api-error.js";

/** Сообщения для статусов, которые ставит фреймворк, а не наш код */
const FALLBACK: Record<number, ApiErrorBody> = {
  400: { code: "bad_request", message: "Некорректный запрос" },
  404: { code: "not_found", message: "Такого адреса нет" },
  405: { code: "method_not_allowed", message: "Метод не поддерживается" },
  413: { code: "payload_too_large", message: "Слишком большой запрос" },
  415: { code: "unsupported_media_type", message: "Неподдерживаемый формат запроса" },
  429: { code: "too_many_requests", message: "Слишком много запросов — попробуйте чуть позже" },
};
const INTERNAL: ApiErrorBody = { code: "internal", message: "Что-то пошло не так — попробуйте позже" };

const isApiErrorBody = (value: unknown): value is ApiErrorBody =>
  typeof value === "object" && value !== null && "code" in value && "message" in value;

/** Любая ошибка уходит клиенту в формате контракта `Error { code, message }`; 5xx — в лог со стеком */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ApiExceptionFilter");

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const response = host.switchToHttp().getResponse();
    const { status, body } = this.toResponse(exception);
    if (status >= 500) this.logger.error(exception instanceof Error ? exception.stack : exception);
    httpAdapter.reply(response, body, status);
  }

  private toResponse(exception: unknown): { status: number; body: ApiErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      if (isApiErrorBody(payload)) return { status, body: payload };
      return { status, body: FALLBACK[status] ?? (status >= 500 ? INTERNAL : { code: "error", message: exception.message }) };
    }
    // Ошибки Fastify (тело слишком большое, неверный JSON) несут statusCode
    const statusCode = (exception as { statusCode?: unknown } | null)?.statusCode;
    if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 500) {
      return { status: statusCode, body: FALLBACK[statusCode] ?? FALLBACK[400] };
    }
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: INTERNAL };
  }
}
