import type { StandardSchemaV1 } from "@standard-schema/spec";

type ZodLike = { _zod?: { def: { type: string; innerType?: unknown; element?: unknown } } } | undefined;

/** Поле zod-схемы без обёрток optional / default / nullable */
const unwrap = (schema: unknown): ZodLike => {
  let current = schema as ZodLike;
  while (current?._zod?.def.innerType) current = current._zod.def.innerType as ZodLike;
  return current;
};

/** Строку — в число или булево, если так требует схема; иначе как есть */
const coerceScalar = (type: string | undefined, raw: unknown): unknown => {
  if (typeof raw !== "string") return raw;
  if (type === "number" && raw.trim() !== "" && !Number.isNaN(Number(raw))) return Number(raw);
  if (type === "boolean" && (raw === "true" || raw === "false")) return raw === "true";
  return raw;
};

/**
 * Строка запроса и путь приходят строками, а в контракте `limit` — целое. Приводим значения
 * только тех полей, у которых в схеме число или булево: строковый параметр, похожий на число
 * (slug «1988»), остаётся строкой. Массив в строке запроса — повтор параметра (`?country=a&country=b`);
 * один повтор Fastify отдаёт строкой — оборачиваем в массив и приводим элементы по их типу.
 * Схемы не-zod и не-объекты возвращаются как есть.
 */
export const coerceParams = (schema: StandardSchemaV1, value: unknown): unknown => {
  const shape = (schema as { shape?: Record<string, unknown> }).shape;
  if (!shape || typeof value !== "object" || value === null) return value;
  const result: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  for (const [key, raw] of Object.entries(result)) {
    const field = unwrap(shape[key]);
    const type = field?._zod?.def.type;
    if (type === "array") {
      const elementType = unwrap(field?._zod?.def.element)?._zod?.def.type;
      result[key] = (Array.isArray(raw) ? raw : [raw]).map((item) => coerceScalar(elementType, item));
    } else {
      result[key] = coerceScalar(type, raw);
    }
  }
  return result;
};
