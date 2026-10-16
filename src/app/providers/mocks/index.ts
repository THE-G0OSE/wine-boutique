import { env } from "@/shared/config/env";

/**
 * Пока нет бэкенда (VITE_API_MOCKS=true), запросы к API обслуживает MSW.
 * Модуль с обработчиками грузится динамически — в основной бандл он не попадает.
 */
export const enableMocking = async () => {
  if (!env.apiMocks) return;
  const { worker } = await import("./browser");
  // bypass: картинки, шрифты и всё, чего нет в контракте, идёт в сеть как обычно
  await worker.start({ onUnhandledFrame: "bypass", quiet: true });
};
