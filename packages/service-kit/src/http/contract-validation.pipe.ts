import { HttpStatus, Injectable, StandardSchemaValidationPipe, type ArgumentMetadata } from "@nestjs/common";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { ApiError } from "./api-error.js";
import { coerceParams } from "./coerce-params.js";

class RequestValidationError extends Error {
  constructor(readonly issues: readonly StandardSchemaV1.Issue[]) {
    super("Запрос не прошёл схему контракта");
  }
}

const pathOf = (issue: StandardSchemaV1.Issue) =>
  issue.path?.map((segment) => String(typeof segment === "object" ? segment.key : segment)).join(".") ?? "";

/**
 * Встроенная в Nest 12 проверка по Standard Schema (`@Body({ schema })`, `@Query({ schema })`),
 * но со статусами из контракта: тело запроса — 422, путь и строка запроса — 400.
 * Строки пути и запроса сначала приводятся к числам и булевым по схеме (`coerceParams`).
 */
@Injectable()
export class ContractValidationPipe extends StandardSchemaValidationPipe {
  constructor() {
    super({ exceptionFactory: (issues) => new RequestValidationError(issues) });
  }

  override async transform<T = unknown>(value: T, metadata: ArgumentMetadata): Promise<T> {
    const schema = (metadata as { schema?: StandardSchemaV1 }).schema;
    const input = schema && (metadata.type === "query" || metadata.type === "param") ? coerceParams(schema, value) : value;
    try {
      return (await super.transform(input, metadata)) as T;
    } catch (error) {
      if (!(error instanceof RequestValidationError)) throw error;
      const status = metadata.type === "body" ? HttpStatus.UNPROCESSABLE_ENTITY : HttpStatus.BAD_REQUEST;
      throw new ApiError(
        status,
        "validation_failed",
        "Проверьте данные запроса",
        error.issues.map((issue) => ({ path: pathOf(issue), message: issue.message }))
      );
    }
  }
}
