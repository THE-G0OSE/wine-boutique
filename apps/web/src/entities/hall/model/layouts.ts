import type { ApiSchemas } from "@/shared/api";

export type HallLayout = ApiSchemas["HallLayout"];

interface ILayoutMeta {
  title: string;
  capacity: number;
  /** Описание рассадки: на десктопе длиннее */
  text: { desktop: string; mobile: string };
}

/** Три рассадки зала (макеты Hall и MHall); вместимость — как в правилах сервиса requests */
export const HALL_LAYOUTS: Record<HallLayout, ILayoutMeta> = {
  banquet: {
    title: "Банкет",
    capacity: 14,
    text: {
      desktop: "Один длинный стол при свечах, сомелье ведёт вечер и рассказывает о каждой бутылке.",
      mobile: "Один длинный стол при свечах, сомелье ведёт вечер.",
    },
  },
  buffet: {
    title: "Фуршет",
    capacity: 30,
    text: {
      desktop: "Высокие столы и бар с бутылками — свободное общение, вина меняются по ходу вечера.",
      mobile: "Высокие столы и бар — свободное общение.",
    },
  },
  lecture: {
    title: "Лекция",
    capacity: 24,
    text: { desktop: "Ряды стульев и стол ведущего — для мастер-классов, презентаций и клубных встреч.", mobile: "Ряды стульев и стол ведущего." },
  },
};

export const HALL_LAYOUT_ORDER = Object.keys(HALL_LAYOUTS) as HallLayout[];

export const isHallLayout = (value: string): value is HallLayout => value in HALL_LAYOUTS;
