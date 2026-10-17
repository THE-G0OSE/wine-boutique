import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "@/shared/config/env";

/**
 * Единый RTK Query API. Эндпоинты добавляют слайсы через `baseApi.injectEndpoints`
 * в своём сегменте `api/`. Контракт — api/openapi.yaml.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: env.apiUrl, credentials: "include" }),
  tagTypes: ["Wine", "Grape", "Session", "NewsIssue"],
  endpoints: () => ({}),
});
