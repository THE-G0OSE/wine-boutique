/** Вкладки кабинета (макет Account) — в URL: `/account?tab=cell` */
export const ACCOUNT_TABS = [
  { id: "overview", title: "Обзор" },
  { id: "orders", title: "Брони и заказы" },
  { id: "cell", title: "Моя ячейка" },
  { id: "favorites", title: "Избранное и дегустации" },
  { id: "bonus", title: "Бонусы и сертификаты" },
  { id: "profile", title: "Профиль" },
] as const;

export type AccountTab = (typeof ACCOUNT_TABS)[number]["id"];

export const isAccountTab = (value: string): value is AccountTab => ACCOUNT_TABS.some((tab) => tab.id === value);

/** Карточка-панель кабинета */
export const PANEL = "rounded-3xl border border-cellar-700 bg-cellar-950/80 p-5 lg:p-7.5";
