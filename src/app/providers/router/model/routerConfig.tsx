import { createBrowserRouter } from "react-router";
import MainLayout from "@/app/layouts/MainLayout";
import { HomePage } from "@/pages/home";
import { ROUTES } from "@/shared/config/routes";

/**
 * Карта маршрутов — docs/implementation-plan.md §3. Главная грузится сразу (первый экран),
 * остальные страницы — отдельными чанками по требованию (lazy).
 * Ещё не сделанные адреса показывают шапку и футер.
 */
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    // Пока грузится чанк страницы при прямом заходе — пусто, без мигания заглушки
    HydrateFallback: () => null,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: ROUTES.news,
        lazy: async () => ({ Component: (await import("@/pages/news")).NewsPage }),
      },
      { path: "*", element: null },
    ],
  },
]);
