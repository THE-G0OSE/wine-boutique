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

let apiReady: Promise<unknown> = Promise.resolve();

/**
 * Запросы к API ждут этого обещания. Так приложение рисуется сразу, а не после запуска мок-сервера:
 * MSW в демо-сборке — сотни килобайт, и первый экран без данных лучше пустой страницы.
 */
export const holdApiUntil = (promise: Promise<unknown>) => {
  apiReady = promise;
};

const rawBaseQuery = fetchBaseQuery({ baseUrl: env.apiUrl, credentials: "include", paramsSerializer: serializeParams });

const baseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  await apiReady;
  return rawBaseQuery(args, api, extraOptions);
};

/**
 * Единый RTK Query API. Эндпоинты добавляют слайсы через `baseApi.injectEndpoints`
 * в своём сегменте `api/`. Контракт — api/openapi.yaml.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Wine", "Shelf", "Grape", "Session", "NewsIssue", "NewsArticle", "Tasting", "Profile", "MyReservations", "MyTastings", "MyCell", "MyMonthly", "MyCertificates", "Loyalty", "Favorites"],
  endpoints: () => ({}),
});
