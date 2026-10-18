import { SerializeOptions } from "@nestjs/common";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { z } from "zod";

/**
 * Схема ответа из контракта: `@ContractResponse(zGetGrapesResponse)`.
 *
 * Сериализатор Nest проверяет массив поэлементно, поэтому схему-массив из контракта
 * (`z.array(zGrapeVariety)`) нужно развернуть до элемента — декоратор делает это сам.
 * Ответ, не прошедший схему, — 500: это баг сервиса, а не клиента.
 */
export const ContractResponse = (schema: StandardSchemaV1): MethodDecorator & ClassDecorator =>
  SerializeOptions({ schema: schema instanceof z.ZodArray ? (schema.element as StandardSchemaV1) : schema });
