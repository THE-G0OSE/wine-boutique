export const env = {
  /** Базовый адрес API */
  apiUrl: import.meta.env.VITE_API_URL || "/api",
  /** Отвечать на запросы моками MSW вместо сервера (пока нет бэкенда) */
  apiMocks: import.meta.env.VITE_API_MOCKS === "true",
  /** Публичный дашборд мониторинга (Grafana, только просмотр); пусто — ссылки в футере нет */
  monitoringUrl: import.meta.env.VITE_MONITORING_URL || "",
} as const;
