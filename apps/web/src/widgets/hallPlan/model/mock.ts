import type { IconType } from "react-icons";
import { LuBriefcase, LuCake, LuGem, LuWine } from "react-icons/lu";
import type { HallLayout } from "@/entities/hall";

/** Мебель на чертеже: стул, стол (прямоугольный) или круглый стол — в координатах листа */
export interface PlanPiece {
  kind: "chair" | "table" | "round";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlanNote {
  text: string;
  x: number;
  y: number;
}

interface IPlan {
  /** Размер листа в px макета: Hall — 1088×640, MHall — 326×300 */
  width: number;
  height: number;
  chair: number;
  pieces: Record<HallLayout, PlanPiece[]>;
  notes: Record<HallLayout, PlanNote[]>;
}

const chairs = (size: number, points: [number, number][]): PlanPiece[] => points.map(([x, y]) => ({ kind: "chair", x, y, w: size, h: size }));
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Чертёж зала на десктопе (Hall): координаты из макета */
const DESKTOP: IPlan = {
  width: 1088,
  height: 640,
  chair: 22,
  pieces: {
    banquet: [
      { kind: "table", x: 300, y: 250, w: 560, h: 90 },
      ...chairs(22, range(6).flatMap((i) => [[320 + i * 92, 212] as [number, number], [320 + i * 92, 356] as [number, number]])),
      ...chairs(22, [
        [262, 284],
        [876, 284],
      ]),
      { kind: "table", x: 560, y: 430, w: 60, h: 30 },
    ],
    buffet: [
      ...(
        [
          [220, 160],
          [500, 130],
          [780, 160],
          [300, 380],
          [640, 380],
        ] as [number, number][]
      ).map(([x, y]): PlanPiece => ({ kind: "round", x, y, w: 90, h: 90 })),
      { kind: "table", x: 380, y: 520, w: 400, h: 40 },
    ],
    lecture: [
      { kind: "table", x: 470, y: 110, w: 220, h: 50 },
      ...chairs(22, range(4).flatMap((r) => range(6).map((c): [number, number] => [330 + c * 86 + (c > 2 ? 40 : 0), 250 + r * 70]))),
    ],
  },
  notes: {
    banquet: [
      { text: "длинный стол · 14 мест", x: 470, y: 160 },
      { text: "место сомелье", x: 520, y: 470 },
    ],
    buffet: [
      { text: "высокие столы", x: 470, y: 90 },
      { text: "барная стойка с бутылками", x: 470, y: 490 },
    ],
    lecture: [{ text: "стол ведущего", x: 520, y: 76 }],
  },
};

/** Чертёж на мобильных (MHall): свой лист и масштаб, без подписей */
const MOBILE: IPlan = {
  width: 326,
  height: 300,
  chair: 14,
  pieces: {
    banquet: [
      { kind: "table", x: 60, y: 120, w: 210, h: 50 },
      ...chairs(14, range(6).flatMap((i) => [[68 + i * 34, 96] as [number, number], [68 + i * 34, 180] as [number, number]])),
      ...chairs(14, [
        [38, 138],
        [278, 138],
      ]),
    ],
    buffet: [
      ...(
        [
          [50, 70],
          [160, 50],
          [250, 80],
          [90, 170],
          [210, 170],
        ] as [number, number][]
      ).map(([x, y]): PlanPiece => ({ kind: "round", x, y, w: 50, h: 50 })),
      { kind: "table", x: 90, y: 240, w: 160, h: 22 },
    ],
    lecture: [
      { kind: "table", x: 110, y: 46, w: 110, h: 26 },
      ...chairs(14, range(4).flatMap((r) => range(6).map((c): [number, number] => [60 + c * 36 + (c > 2 ? 20 : 0), 110 + r * 38]))),
    ],
  },
  notes: { banquet: [], buffet: [], lecture: [] },
};

export const HALL_PLANS = { desktop: DESKTOP, mobile: MOBILE };

/** Что входит в аренду: на мобильных подписи короче */
export const HALL_INCLUDED = [
  { desktop: "Сомелье на весь вечер", mobile: "Сомелье на весь вечер" },
  { desktop: "Бокалы под каждый стиль вина", mobile: "Бокалы под каждый стиль" },
  { desktop: "Подбор вин под меню и бюджет", mobile: "Подбор вин под меню" },
  { desktop: "Закуски или ужин от шефа — по желанию", mobile: "Ужин от шефа — по желанию" },
];

export const HALL_OCCASIONS: { icon: IconType; title: string; text: { desktop: string; mobile: string } }[] = [
  { icon: LuCake, title: "День рождения", text: { desktop: "Бутылка вашего года рождения из погреба — по запросу.", mobile: "Бутылка вашего года рождения — по запросу." } },
  { icon: LuBriefcase, title: "Команда", text: { desktop: "Тимбилдинг-дегустация вслепую с призами.", mobile: "Слепая дегустация с призами." } },
  { icon: LuGem, title: "Предложение", text: { desktop: "Закроем зал для двоих и спрячем кольцо в ящик с вином.", mobile: "Закроем зал для двоих." } },
  { icon: LuWine, title: "Клуб", text: { desktop: "Регулярные встречи винного клуба со скидкой.", mobile: "Регулярные встречи." } },
];
