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

export type CellarErrorCode = "invalid_request" | "cell_busy";

export class CellarError extends Error {
  constructor(
    readonly code: CellarErrorCode,
    message: string
  ) {
    super(message);
  }
}
