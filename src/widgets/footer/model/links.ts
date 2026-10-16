import { HOME_ANCHORS, ROUTES } from "@/shared/config/routes";

export interface IFooterColumn {
  title: string;
  links: { label: string; to: string }[];
}

export const FOOTER_COLUMNS: IFooterColumn[] = [
  {
    title: "Навигация",
    links: [
      { label: "Главная", to: ROUTES.home },
      { label: "Новости", to: ROUTES.news },
      { label: "Магазин", to: ROUTES.shop },
      { label: "Отзывы", to: ROUTES.reviews },
    ],
  },
  {
    title: "Наш дом",
    links: [
      { label: "Виноградники", to: `${ROUTES.home}#${HOME_ANCHORS.vineyards}` },
      { label: "Ячейка в погребе", to: ROUTES.cellar },
      { label: "Дегустации", to: ROUTES.tastings },
      { label: "Аренда зала", to: ROUTES.hall },
    ],
  },
  {
    title: "Подарки",
    links: [
      { label: "Набор месяца", to: ROUTES.monthly },
      { label: "Подарочные сертификаты", to: ROUTES.certificates },
      { label: "Корпоративные подарки", to: ROUTES.gifts },
    ],
  },
  {
    title: "Покупателям",
    links: [
      { label: "Бронь и самовывоз", to: ROUTES.pickup },
      { label: "Как хранить вино", to: ROUTES.storage },
      { label: "Вопросы и ответы", to: ROUTES.faq },
    ],
  },
];
