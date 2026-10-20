/**
 * Ячейки погреба и заявки — правила совпадают с эталоном @wine/demo-data (тесты сверяют):
 * стена — по рядам сверху вниз и местам слева направо; заявка — только на свободную ячейку, ячейку она не занимает.
 */

/** Версия текста политики конфиденциальности — сохраняется с заявкой (152-ФЗ) */
export const CONSENT_VERSION = "2026-10-20";

export type CellTier = "small" | "medium" | "large";
export type StorageTerm = "3m" | "1y" | "3y";

export interface Cell {
  number: string;
  row: number;
  position: number;
  tier: CellTier;
  capacity: number;
  status: "free" | "busy";
  priceKopecks: number | null;
}

export interface CellRequest {
  id: string;
  cellNumber: string;
  tier: CellTier;
  term: StorageTerm;
}

export type CellarErrorCode = "invalid_request" | "cell_busy" | "not_found" | "invalid_preparation";

export class CellarError extends Error {
  constructor(
    readonly code: CellarErrorCode,
    message: string
  ) {
    super(message);
  }
}

export interface CellBottle {
  id: string;
  name: string;
  meta: string;
  imageUrl: string;
  qty: number;
  since: string;
  photos: number;
  readyFrom: number | null;
}

export interface MyCell {
  cell: Cell;
  paidUntil: string;
  bottles: CellBottle[];
  preparation: { bottleIds: string[]; visitAt: Date } | null;
}

/**
 * Условия в погребе. Датчиков пока нет — последний ручной замер управляющего;
 * с подключением датчика значение придёт из него
 */
export const CELLAR_CONDITIONS = { temperature: 12.8, humidity: 71 };

/** К визиту: не раньше чем через 2 часа (сомелье нужно время) и не дальше 30 дней */
export const PREPARATION_LEAD_MS = 2 * 60 * 60 * 1000;
export const PREPARATION_HORIZON_MS = 30 * 24 * 60 * 60 * 1000;
