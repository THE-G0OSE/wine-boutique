import { HttpException } from "@nestjs/common";

/** Тело ошибки — как схема `Error` в контракте, плюс подробности для ошибок валидации */
export interface ApiErrorBody {
  code: string;
  /** Текст для пользователя, на русском */
  message: string;
  details?: unknown;
}

/** Ошибка, которая уходит клиенту в формате контракта: `throw new ApiError(404, "not_found", "Такой вырезки нет")` */
export class ApiError extends HttpException {
  constructor(status: number, code: string, message: string, details?: unknown) {
    super({ code, message, ...(details === undefined ? {} : { details }) } satisfies ApiErrorBody, status);
  }

  get body(): ApiErrorBody {
    return this.getResponse() as ApiErrorBody;
  }
}
