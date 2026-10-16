export const env = {
  /** Базовый адрес API */
  apiUrl: import.meta.env.VITE_API_URL || "/api",
  /** Отвечать на запросы моками MSW вместо сервера (пока нет бэкенда) */
  apiMocks: import.meta.env.VITE_API_MOCKS === "true",
} as const;
