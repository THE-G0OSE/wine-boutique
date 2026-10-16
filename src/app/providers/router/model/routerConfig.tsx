import { createBrowserRouter } from "react-router";
import MainLayout from "@/app/layouts/MainLayout";
import { HomePage } from "@/pages/home";

/**
 * Карта маршрутов — docs/implementation-plan.md §3. Пока готова только главная:
 * остальные адреса показывают шапку и футер, страницы появятся в следующих фазах.
 */
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: null },
    ],
  },
]);
