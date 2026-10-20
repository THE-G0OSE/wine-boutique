import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "@/shared/config/env";

/**
 * Параметры запроса как в контракте: массив — повтор параметра (`?country=Италия&country=Франция`),
 * пустые значения не отправляются. URLSearchParams по умолчанию склеил бы массив через запятую.
 */
const serializeParams = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item === undefined || item === null || item === "") continue;
      search.append(key, String(item));
    }
  }
  return search.toString();
};

/**
 * Единый RTK Query API. Эндпоинты добавляют слайсы через `baseApi.injectEndpoints`
 * в своём сегменте `api/`. Контракт — api/openapi.yaml.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: env.apiUrl, credentials: "include", paramsSerializer: serializeParams }),
  tagTypes: ["Wine", "Shelf", "Grape", "Session", "NewsIssue", "NewsArticle", "Tasting", "Profile", "MyReservations", "MyTastings", "MyCell", "MyMonthly", "MyCertificates", "Loyalty", "Favorites"],
  endpoints: () => ({}),
});
