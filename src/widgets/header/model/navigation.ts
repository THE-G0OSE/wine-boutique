import { ROUTES } from "@/shared/config/routes";

export interface INavLink {
  label: string;
  to: string;
}

/** Основная навигация шапки (десктоп и мобильное меню) */
export const MAIN_NAV: INavLink[] = [
  { label: "Главная", to: ROUTES.home },
  { label: "Новости", to: ROUTES.news },
  { label: "Магазин", to: ROUTES.shop },
  { label: "Дегустации", to: ROUTES.tastings },
  { label: "Погреб", to: ROUTES.cellar },
  { label: "Отзывы", to: ROUTES.reviews },
];

/** Дополнительные разделы в мобильном меню */
export const MOBILE_EXTRA_NAV: INavLink[] = [
  { label: "Набор месяца", to: ROUTES.monthly },
  { label: "Сертификаты", to: ROUTES.certificates },
  { label: "Аренда зала", to: ROUTES.hall },
  { label: "Подарки компаниям", to: ROUTES.gifts },
  { label: "Бронь и самовывоз", to: ROUTES.pickup },
  { label: "Вопросы и ответы", to: ROUTES.faq },
];

/** После скольких пикселей прокрутки шапка становится тёмной */
export const HEADER_SOLID_AFTER = 80;
