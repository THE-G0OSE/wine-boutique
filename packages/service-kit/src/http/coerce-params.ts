import type { StandardSchemaV1 } from "@standard-schema/spec";

/** Тип поля zod-схемы без обёрток optional / default / nullable */
const baseType = (schema: unknown): string | undefined => {
  let current = schema as { _zod?: { def: { type: string; innerType?: unknown } } } | undefined;
  while (current?._zod?.def.innerType) current = current._zod.def.innerType as typeof current;
  return current?._zod?.def.type;
};

/**
 * Строка запроса и путь приходят строками, а в контракте `limit` — целое. Приводим значения
 * только тех полей, у которых в схеме число или булево: строковый параметр, похожий на число
 * (slug «1988»), остаётся строкой. Схемы не-zod и не-объекты возвращаются как есть.
 */
export const coerceParams = (schema: StandardSchemaV1, value: unknown): unknown => {
  const shape = (schema as { shape?: Record<string, unknown> }).shape;
  if (!shape || typeof value !== "object" || value === null) return value;
  const result: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  for (const [key, raw] of Object.entries(result)) {
    if (typeof raw !== "string") continue;
    const type = baseType(shape[key]);
    if (type === "number" && raw.trim() !== "" && !Number.isNaN(Number(raw))) result[key] = Number(raw);
    else if (type === "boolean" && (raw === "true" || raw === "false")) result[key] = raw === "true";
  }
  return result;
};
