import type { GrapeType } from "@/entities/grapeVariety";

export interface GrapePlace {
  /** Координаты верхнего левого угла и высота грозди в макете 1920×1080 (артборд Main) */
  x: number;
  y: number;
  height: number;
  /** Наклон грозди в покое, градусы */
  rotate: number;
}

/** Где висит каждая гроздь (по slug сорта) */
export const GRAPE_PLACES: Record<string, GrapePlace> = {
  "cabernet-sauvignon": { x: 150, y: 520, height: 330, rotate: -6 },
  chardonnay: { x: 455, y: 650, height: 300, rotate: 5 },
  merlot: { x: 760, y: 550, height: 320, rotate: -3 },
  "sauvignon-blanc": { x: 1065, y: 660, height: 290, rotate: 6 },
  "pinot-noir": { x: 1365, y: 530, height: 310, rotate: -5 },
  riesling: { x: 1645, y: 640, height: 300, rotate: 4 },
};

/**
 * Телефон (портрет): та же лоза, грозди в два ряда по три. Координаты — в px сцены 390×840
 * (масштабируются по ширине экрана); сверху — заголовок до четырёх строк
 */
export const COMPACT_SCENE = { width: 390, height: 840 } as const;

export const GRAPE_PLACES_COMPACT: Record<string, GrapePlace> = {
  "cabernet-sauvignon": { x: 16, y: 384, height: 176, rotate: -6 },
  chardonnay: { x: 138, y: 428, height: 160, rotate: 5 },
  merlot: { x: 254, y: 380, height: 172, rotate: -3 },
  "sauvignon-blanc": { x: 24, y: 608, height: 160, rotate: 6 },
  "pinot-noir": { x: 140, y: 644, height: 166, rotate: -5 },
  riesling: { x: 258, y: 610, height: 160, rotate: 4 },
};

/** Пропорции изображений гроздей */
export const GRAPE_ASPECT = 0.677;

/** Цвета по типу сорта: на тёмном фоне, на «бумаге» и свечение грозди при наведении */
export const GRAPE_TONE: Record<GrapeType, { line: string; onDark: string; onPaper: string; glow: string }> = {
  red: {
    line: "bg-primary-200",
    onDark: "text-primary-200",
    onPaper: "text-primary-500",
    glow: "color-mix(in srgb, var(--color-primary-200) 70%, transparent)",
  },
  white: {
    line: "bg-secondary-500",
    onDark: "text-secondary-200",
    onPaper: "text-secondary-500",
    glow: "color-mix(in srgb, var(--color-secondary-200) 65%, transparent)",
  },
};

/** Декор секции: «дыхание» тёплого света и затемнение сверху и снизу */
export const VINEYARD_GLOW =
  "radial-gradient(ellipse 900px 520px at 52% 34%, rgba(255,186,90,0.30) 0%, rgba(255,186,90,0) 70%), radial-gradient(ellipse 600px 420px at 78% 60%, rgba(255,200,120,0.18) 0%, rgba(255,200,120,0) 70%)";
export const VINEYARD_SHADE =
  "linear-gradient(180deg, rgba(17,12,10,0.92) 0%, rgba(17,12,10,0.55) 32%, rgba(17,12,10,0.05) 58%, rgba(17,12,10,0.3) 84%, rgba(17,12,10,0.82) 100%)";
export const VINEYARD_SHADE_MOBILE =
  "linear-gradient(180deg, rgba(17,12,10,0.85) 0%, rgba(17,12,10,0.2) 40%, rgba(17,12,10,0.25) 70%, rgba(17,12,10,0.9) 100%)";

/** Фильтр грозди: в покое приглушена, при наведении светлеет и светится цветом сорта */
export const grapeFilter = (type: GrapeType, isHovered: boolean) =>
  isHovered
    ? `brightness(0.9) contrast(0.96) saturate(0.88) sepia(0.1) drop-shadow(0 0 26px ${GRAPE_TONE[type].glow}) drop-shadow(10px 26px 18px rgba(0,0,0,0.6))`
    : "brightness(0.68) contrast(0.9) saturate(0.75) sepia(0.2) drop-shadow(10px 26px 18px rgba(0,0,0,0.6))";
