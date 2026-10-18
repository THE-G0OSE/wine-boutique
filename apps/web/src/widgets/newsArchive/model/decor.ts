import type { CSSProperties } from "react";

/** Подшивка за месяц: стопка газет, перевязанная бечёвкой (артборд Archive) */
const SHEET_TOP = "#EFE6D3";
const SHEET_LIGHT = "#E2D6BE";
const SHEET_DARK = "#D9CBAF";
export const TWINE = "#A57A48";

const SHEET_HEIGHT = 120;
const SHEET_STEP = 7;

/** Высота стопки: на каждый выпуск — лист, плюс пара листов подложки */
export const stackHeight = (issues: number) => SHEET_HEIGHT + (issues + 2) * SHEET_STEP;

/** Листы стопки снизу вверх: чуть сдвинуты и повёрнуты, верхний — светлее */
export const stackSheets = (issues: number): CSSProperties[] =>
  Array.from({ length: issues + 3 }, (_, k) => ({
    left: k % 2 ? 2 : -2,
    right: k % 2 ? -3 : 3,
    bottom: k * SHEET_STEP,
    height: SHEET_HEIGHT,
    background: k === issues + 2 ? SHEET_TOP : k % 2 ? SHEET_LIGHT : SHEET_DARK,
    rotate: `${(((k * 37) % 5) - 2) * 0.4}deg`,
  }));
