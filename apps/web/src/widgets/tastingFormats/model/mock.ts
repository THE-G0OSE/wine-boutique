import type { TastingKind } from "@/entities/tasting";

export interface TastingFormat {
  kind: TastingKind;
  title: string;
  /** Описание на десктопе и короче — на мобильных */
  text: { desktop: string; mobile: string };
  meta: string;
}

/** Четыре формата дегустаций (макеты Tastings и MTastings) */
export const TASTING_FORMATS: TastingFormat[] = [
  {
    kind: "vertical",
    title: "Вертикаль",
    text: { desktop: "Несколько урожаев одного вина подряд — лучший способ понять, как работает время.", mobile: "Несколько урожаев одного вина." },
    meta: "5–6 вин · 2 часа",
  },
  {
    kind: "blind",
    title: "Слепая",
    text: { desktop: "Бутылки в чехлах. Учимся доверять носу, а не этикетке.", mobile: "Бутылки в чехлах — доверяем носу." },
    meta: "6 вин · 2 часа",
  },
  {
    kind: "dinner",
    title: "Гастроужин",
    text: { desktop: "Шеф готовит пять подач под вина из погреба.", mobile: "Пять подач от шефа." },
    meta: "5 вин · 3 часа",
  },
  {
    kind: "masterclass",
    title: "Мастер-класс",
    text: { desktop: "Для тех, кто только начинает: как пробовать и о чём говорить.", mobile: "Для тех, кто начинает." },
    meta: "3–4 вина · 1,5 часа",
  },
];
