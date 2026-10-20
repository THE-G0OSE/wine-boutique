import { ROUTES } from "@/shared/config/routes";

export type FaqTopic = "buy" | "wine" | "events" | "gifts";

/** Темы доски: на мобильных «Дегустации» — «События» (MFaq) */
export const FAQ_TOPICS: { id: FaqTopic | "all"; title: { desktop: string; mobile: string } }[] = [
  { id: "all", title: { desktop: "Все", mobile: "Все" } },
  { id: "buy", title: { desktop: "Покупка", mobile: "Покупка" } },
  { id: "wine", title: { desktop: "О вине", mobile: "О вине" } },
  { id: "events", title: { desktop: "Дегустации", mobile: "События" } },
  { id: "gifts", title: { desktop: "Подарки", mobile: "Подарки" } },
];

export interface FaqNote {
  id: string;
  topic: FaqTopic;
  question: string;
  answer: string;
  link?: { to: string; label: string };
}

/** Записки с пробковой доски бутика (макет Faq) */
export const FAQ_NOTES: FaqNote[] = [
  {
    id: "delivery",
    topic: "buy",
    question: "Почему вы не доставляете вино?",
    answer: "Дистанционная продажа алкоголя в России запрещена. Мы бронируем бутылки на ваше имя — вы забираете их в бутике.",
    link: { to: ROUTES.pickup, label: "Как работает бронь →" },
  },
  {
    id: "hold",
    topic: "buy",
    question: "Сколько держится бронь?",
    answer: "Три дня. Продлить можно звонком, а для долгого хранения есть ячейки в погребе.",
    link: { to: ROUTES.cellar, label: "Про ячейки →" },
  },
  { id: "pay", topic: "buy", question: "Как оплатить?", answer: "В бутике при получении — картой или наличными. Онлайн оплачиваются только сертификаты." },
  {
    id: "try",
    topic: "wine",
    question: "Можно попробовать перед покупкой?",
    answer: "Да, большинство бутылок открываем на пробу в бутике. Редкие — на дегустациях.",
    link: { to: ROUTES.tastings, label: "Расписание дегустаций →" },
  },
  {
    id: "authentic",
    topic: "wine",
    question: "Как понять, что вино подлинное?",
    answer: "Каждая бутылка приходит с документами о происхождении, сомелье проверяет пробку, капсулу и уровень вина.",
  },
  {
    id: "home",
    topic: "wine",
    question: "Как хранить бутылку дома?",
    answer: "Лёжа, в темноте, при +10…14 °C и подальше от вибраций.",
    link: { to: ROUTES.storage, label: "Справочник по хранению →" },
  },
  {
    id: "signup",
    topic: "events",
    question: "Нужно ли записываться на дегустацию?",
    answer: "Да, мест за столом — 12. Запись в календаре, напоминание придёт SMS.",
    link: { to: ROUTES.tastings, label: "Записаться →" },
  },
  {
    id: "hall",
    topic: "events",
    question: "Можно ли арендовать погреб?",
    answer: "Можно: банкет до 14 гостей, фуршет до 30, лекция до 24.",
    link: { to: ROUTES.hall, label: "Аренда зала →" },
  },
  {
    id: "certificates",
    topic: "gifts",
    question: "Есть подарочные сертификаты?",
    answer: "Есть — электронные и в конверте с сургучом, на любую сумму от 3 000 ₽.",
    link: { to: ROUTES.certificates, label: "Выбрать сертификат →" },
  },
  {
    id: "corporate",
    topic: "gifts",
    question: "Делаете подарки для компаний?",
    answer: "Собираем ящики от 10 штук: упаковка, гравировка, логотип, документы.",
    link: { to: ROUTES.gifts, label: "Собрать подарок →" },
  },
  { id: "age", topic: "buy", question: "С какого возраста можно покупать?", answer: "С 18 лет. Паспорт спросим при получении заказа даже у постоянных гостей." },
  {
    id: "monthly",
    topic: "gifts",
    question: "Что такое набор месяца?",
    answer: "Ящик из трёх вин на тему месяца, который мы откладываем на ваше имя.",
    link: { to: ROUTES.monthly, label: "Подробнее →" },
  },
];

/** Цвет записки и булавки по порядку — как в макете */
export const NOTE_COLORS = ["bg-paper", "bg-note-yellow", "bg-note-pink", "bg-note-mint", "bg-paper", "bg-note-lilac"];
export const PIN_COLORS = ["var(--color-primary-200)", "var(--color-secondary-200)", "var(--color-pin-blue)", "var(--color-pin-green)"];
