import { Injectable, SetMetadata, type CallHandler, type ExecutionContext, type NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { catchError, type Observable } from "rxjs";
import { ApiError } from "./api-error.js";

const VALIDATION_ERROR = "wine:validation-error";

interface ValidationErrorOverride {
  code: string;
  message: string;
}

/**
 * Свой код и текст для ошибки валидации на этом обработчике — как в контракте и моках формы:
 * `@ValidationError("invalid_email", "Проверьте адрес — кажется, в нём опечатка")`. Подробности по полям сохраняются.
 */
export const ValidationError = (code: string, message: string) => SetMetadata(VALIDATION_ERROR, { code, message } satisfies ValidationErrorOverride);

/** Подменяет `validation_failed` на код и текст из `@ValidationError` (пайпы выполняются внутри перехватчика) */
@Injectable()
export class ValidationErrorInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const override = this.reflector.getAllAndOverride<ValidationErrorOverride | undefined>(VALIDATION_ERROR, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!override) return next.handle();
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof ApiError && error.body.code === "validation_failed") {
          throw new ApiError(error.getStatus(), override.code, override.message, error.body.details);
        }
        throw error;
      })
    );
  }
}
