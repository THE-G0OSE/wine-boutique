import type { MonthlyPlan } from "@/entities/monthlyCrate";

/** Якоря страницы набора: кнопки hero ведут к тарифам и архиву */
export const MONTHLY_ANCHORS = { plans: "plans", archive: "archive" } as const;

/** Тарифы набора (макеты Monthly и MMonthly); цена — плейсхолдер дизайна */
export const MONTHLY_PLANS: { id: MonthlyPlan; count: string; title: string; text: { desktop: string; mobile: string } }[] = [
  { id: "duo", count: "2", title: "Знакомство", text: { desktop: "Два вина на тему месяца — для тех, кто только начинает.", mobile: "два вина на тему" } },
  { id: "classic", count: "3", title: "Классика", text: { desktop: "Три вина и записка сомелье. Самый популярный ящик.", mobile: "три вина и записка" } },
  { id: "cellar", count: "6", title: "Погреб", text: { desktop: "Шесть бутылок: три на сейчас и три — на хранение в вашей ячейке.", mobile: "три на сейчас, три — на хранение" } },
];

/** Бутылки над ящиком в hero — как в макете: красное, флейта, бургундская */
export const HERO_BOTTLES = ["/images/bottles/red.webp", "/images/bottles/flute.webp", "/images/bottles/burgundy.webp"];
