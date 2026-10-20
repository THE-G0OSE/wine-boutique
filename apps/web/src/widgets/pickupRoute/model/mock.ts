import { ROUTES } from "@/shared/config/routes";

/** Якорь списка бутиков на странице самовывоза */
export const BOUTIQUES_ANCHOR = "boutiques";

export interface RouteStop {
  title: string;
  /** Текст на записке (десктоп) и на карточке (мобильные — короче) */
  text: { desktop: string; mobile: string };
  link: { to: string; label: { desktop: string; mobile: string } };
  /** Где на карте 1680×760 стоит отметка (макет Pickup) */
  pin: { x: number; y: number };
}

/** Четыре остановки пути бутылки (макеты Pickup и MPickup) */
export const ROUTE_STOPS: RouteStop[] = [
  {
    title: "Выбор",
    text: {
      desktop: "Выбираете бутылки на полках сайта и кладёте в корзину. Если сомневаетесь — сомелье подскажет по телефону.",
      mobile: "Кладёте бутылки в корзину на сайте.",
    },
    link: { to: ROUTES.shop, label: { desktop: "К полкам →", mobile: "К полкам →" } },
    pin: { x: 90, y: 470 },
  },
  {
    title: "Бронь",
    text: {
      desktop: "Указываете имя, телефон, бутик и время. Мы снимаем бутылки с продажи и присылаем SMS с номером брони.",
      mobile: "Имя, телефон, бутик и время — и мы присылаем SMS с номером.",
    },
    link: { to: ROUTES.reserve, label: { desktop: "Как оформить бронь →", mobile: "Оформить бронь →" } },
    pin: { x: 520, y: 380 },
  },
  {
    title: "Погреб",
    text: {
      desktop: "Бутылки ждут вас 3 дня при +12 °C. Нужно дольше — продлим или переложим в личную ячейку.",
      mobile: "Бутылки ждут 3 дня при +12 °C. Можно продлить.",
    },
    link: { to: ROUTES.cellar, label: { desktop: "Про ячейки →", mobile: "Про ячейки →" } },
    pin: { x: 960, y: 230 },
  },
  {
    title: "Бутик",
    text: {
      desktop: "Показываете номер брони и паспорт, оплачиваете картой или наличными. Можно попробовать вино на месте.",
      mobile: "Паспорт, номер брони, оплата на месте.",
    },
    link: { to: `#${BOUTIQUES_ANCHOR}`, label: { desktop: "Адреса бутиков ↓", mobile: "Адреса ↓" } },
    pin: { x: 1400, y: 150 },
  },
];

/** Правила брони: { что, как } — на мобильных короче */
export const RESERVATION_RULES = [
  { key: "3 дня", desktop: "столько держим бронь, продление — по звонку", mobile: "держим бронь" },
  { key: "Оплата", desktop: "только в бутике, картой или наличными", mobile: "только в бутике" },
  { key: "18+", desktop: "выдаём заказ по паспорту, без исключений", mobile: "выдаём по паспорту" },
  { key: "Отмена", desktop: "бесплатно, одной SMS или звонком", mobile: "бесплатно, одной SMS" },
  { key: "Проба", desktop: "большинство бутылок можно попробовать до покупки", mobile: "многие бутылки можно попробовать" },
];
