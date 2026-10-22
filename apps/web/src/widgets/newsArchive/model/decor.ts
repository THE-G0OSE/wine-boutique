import type { CSSProperties } from "react";

/** Подшивка за месяц: стопка газет, перевязанная бечёвкой (артборд Archive) */
const SHEET_TOP = "#EFE6D3";
const SHEET_LIGHT = "#E2D6BE";
const SHEET_DARK = "#D9CBAF";
export const TWINE = "#A57A48";

/** Высота листа стопки: на десктопе — по макету, на телефоне — стопка поменьше, чтобы в ряд влезло 2,5 месяца */
export const SHEET_HEIGHT = { desktop: 120, compact: 74 } as const;
const SHEET_STEP = { desktop: 7, compact: 5 } as const;

type StackSize = keyof typeof SHEET_HEIGHT;

/** Высота стопки: на каждый выпуск — лист, плюс пара листов подложки */
export const stackHeight = (issues: number, size: StackSize = "desktop") => SHEET_HEIGHT[size] + (issues + 2) * SHEET_STEP[size];

/** Листы стопки снизу вверх: чуть сдвинуты и повёрнуты, верхний — светлее */
export const stackSheets = (issues: number, size: StackSize = "desktop"): CSSProperties[] =>
  Array.from({ length: issues + 3 }, (_, k) => ({
    left: k % 2 ? 2 : -2,
    right: k % 2 ? -3 : 3,
    bottom: k * SHEET_STEP[size],
    height: SHEET_HEIGHT[size],
    background: k === issues + 2 ? SHEET_TOP : k % 2 ? SHEET_LIGHT : SHEET_DARK,
    rotate: `${(((k * 37) % 5) - 2) * 0.4}deg`,
  }));
