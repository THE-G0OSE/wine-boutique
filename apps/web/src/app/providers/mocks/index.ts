import { env } from "@/shared/config/env";

/**
 * Пока нет бэкенда (VITE_API_MOCKS=true), запросы к API обслуживает MSW.
 * Модуль с обработчиками грузится динамически — в основной бандл он не попадает.
 *
 * Никогда не бросает: если Service Worker недоступен (приватный режим Firefox, политика браузера),
 * приложение всё равно отрисуется — без данных из API, но с вёрсткой и навигацией.
 */
export const enableMocking = async () => {
  if (!env.apiMocks) return;
  try {
    const { worker } = await import("./browser");
    // bypass: картинки, шрифты и всё, чего нет в контракте, идёт в сеть как обычно
    await worker.start({
      onUnhandledFrame: "bypass",
      quiet: true,
      // Воркер лежит в public/ — с учётом base сборки (GitHub Pages: /wine-boutique/)
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    });
  } catch (error) {
    console.error("[mocks] Не удалось запустить мок-сервер API, данные не загрузятся", error);
  }
};
