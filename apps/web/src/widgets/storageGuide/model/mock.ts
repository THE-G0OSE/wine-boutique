/** Справочник хранения (макеты Storage и MStorage): на мобильных подписи короче */

export interface WineServing {
  title: { desktop: string; mobile: string };
  range: { desktop: string; mobile: string };
  /** Середина диапазона — куда поднимается ртуть, °C */
  degrees: number;
}

export const SERVING: WineServing[] = [
  { title: { desktop: "Игристые", mobile: "Игристые" }, range: { desktop: "6–8 °C", mobile: "6–8°" }, degrees: 7 },
  { title: { desktop: "Лёгкие белые", mobile: "Лёгкие белые" }, range: { desktop: "8–10 °C", mobile: "8–10°" }, degrees: 9 },
  { title: { desktop: "Выдержанные белые", mobile: "Выдерж. белые" }, range: { desktop: "10–13 °C", mobile: "10–13°" }, degrees: 12 },
  { title: { desktop: "Лёгкие красные", mobile: "Лёгкие красные" }, range: { desktop: "13–15 °C", mobile: "13–15°" }, degrees: 14 },
  { title: { desktop: "Полнотелые красные", mobile: "Полнотелые красные" }, range: { desktop: "16–18 °C", mobile: "16–18°" }, degrees: 17 },
  { title: { desktop: "Сладкие и крепл.", mobile: "Сладкие" }, range: { desktop: "10–14 °C", mobile: "10–14°" }, degrees: 12 },
];

/** Шкала термометра: 0…20 °C */
export const THERMOMETER_MAX = 20;
export const THERMOMETER_TICKS = [0, 5, 10, 15, 20];

export const POSITIONS = [
  {
    title: { desktop: "Лёжа", mobile: "Лёжа" },
    ok: true,
    angle: 90,
    text: { desktop: "Пробка остаётся влажной и не пропускает воздух. Так храним всё с натуральной пробкой.", mobile: "Пробка остаётся влажной." },
  },
  {
    title: { desktop: "Под наклоном", mobile: "Наклон" },
    ok: true,
    angle: 60,
    text: { desktop: "Подходит для игристых: пузырёк воздуха упирается в пробку, вино её смачивает.", mobile: "Хорошо для игристых." },
  },
  { title: { desktop: "Стоя", mobile: "Стоя" }, ok: false, angle: 0, text: { desktop: "Только на пару дней или для бутылок с винтовой крышкой.", mobile: "Только на пару дней." } },
];

export const CONDITIONS = [
  { icon: "☾", title: "Темнота", text: { desktop: "Ультрафиолет портит вино за недели. Держите бутылки подальше от окон и ламп.", mobile: "Ультрафиолет портит вино за недели." } },
  {
    icon: "≈",
    title: "Влажность 60–75 %",
    text: { desktop: "Слишком сухо — пробка сохнет, слишком влажно — плесневеют этикетки.", mobile: "Пробка не сохнет, этикетки не плесневеют." },
  },
  { icon: "∿", title: "Без вибраций", text: { desktop: "Не храните вино на холодильнике и рядом со стиральной машиной.", mobile: "Не на холодильнике." } },
  { icon: "⌀", title: "Без запахов", text: { desktop: "Через пробку вино впитывает запахи: краска, химия, продукты — не соседи.", mobile: "Вино впитывает запахи через пробку." } },
];

/** Сколько можно ждать: от и до, лет (30 — «30+») */
export const AGING = [
  { title: "Розе и лёгкие белые", from: 0, to: 2 },
  { title: "Игристые без года", from: 0, to: 3 },
  { title: "Красные на каждый день", from: 0, to: 5 },
  { title: "Выдержанные красные", from: 3, to: 20 },
  { title: "Сотерн и токай", from: 5, to: 30 },
  { title: "Винтажный портвейн", from: 10, to: 30 },
];

/** Подписи шкалы выдержки на десктопе и её неравномерный масштаб: 0–5 лет — пятая часть, 5–10 — ещё пятая, 10–30 — остальное */
export const AGING_LABELS = ["0", "5 лет", "10", "20", "30+"];
export const agingScale = (years: number) =>
  years >= 30 ? 100 : years <= 5 ? (years / 5) * 20 : years <= 10 ? 20 + ((years - 5) / 5) * 20 : 40 + ((years - 10) / 10) * 20;
