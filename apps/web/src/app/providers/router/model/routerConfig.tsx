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
      {
        // Статичный сегмент сильнее :slug — «/news/archive» не примут за статью
        path: ROUTES.newsArchive,
        lazy: async () => ({ Component: (await import("@/pages/newsArchive")).NewsArchivePage }),
      },
      {
        path: ROUTES.article(":slug"),
        lazy: async () => ({ Component: (await import("@/pages/article")).ArticlePage }),
      },
      {
        path: ROUTES.shop,
        lazy: async () => ({ Component: (await import("@/pages/shop")).ShopPage }),
      },
      {
        path: ROUTES.shelf(":shelf"),
        lazy: async () => ({ Component: (await import("@/pages/shelf")).ShelfPage }),
      },
      {
        path: ROUTES.search,
        lazy: async () => ({ Component: (await import("@/pages/search")).SearchPage }),
      },
      {
        path: ROUTES.wine(":slug"),
        lazy: async () => ({ Component: (await import("@/pages/wine")).WinePage }),
      },
      {
        path: ROUTES.reserve,
        lazy: async () => ({ Component: (await import("@/pages/reserve")).ReservePage }),
      },
      {
        path: ROUTES.reservation(":id"),
        lazy: async () => ({ Component: (await import("@/pages/reserveSuccess")).ReserveSuccessPage }),
      },
      {
        path: ROUTES.pickup,
        lazy: async () => ({ Component: (await import("@/pages/pickup")).PickupPage }),
      },
      {
        path: ROUTES.tastings,
        lazy: async () => ({ Component: (await import("@/pages/tastings")).TastingsPage }),
      },
      {
        path: ROUTES.cellar,
        lazy: async () => ({ Component: (await import("@/pages/cellar")).CellarPage }),
      },
      {
        path: ROUTES.reviews,
        lazy: async () => ({ Component: (await import("@/pages/reviews")).ReviewsPage }),
      },
      { path: "*", element: null },
    ],
  },
],
  // На GitHub Pages сайт живёт в подпапке (/wine-boutique/) — маршруты из ROUTES остаются от корня
  { basename: import.meta.env.BASE_URL }
);
