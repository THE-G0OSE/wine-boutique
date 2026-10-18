import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

export const REQUEST_ID_HEADER = "x-request-id";

/**
 * Request id запроса: из заголовка шлюза или новый. Записывается обратно в заголовки запроса,
 * чтобы логгер и ответ взяли одно и то же значение, в каком бы порядке они ни выполнялись.
 */
export const ensureRequestId = (headers: IncomingHttpHeaders): string => {
  const current = headers[REQUEST_ID_HEADER];
  const id = (Array.isArray(current) ? current[0] : current) || randomUUID();
  headers[REQUEST_ID_HEADER] = id;
  return id;
};
