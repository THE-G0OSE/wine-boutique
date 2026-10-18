import type { GrapeType } from "../types";

export const GRAPE_TYPE_LABELS: Record<GrapeType, { short: string; full: string }> = {
  red: { short: "Красный сорт", full: "Красный сорт • Red grape" },
  white: { short: "Белый сорт", full: "Белый сорт • White grape" },
};

/** Участок на плантации; пока не заполнен — плейсхолдер из дизайна */
export const formatPlantation = (plantation: string | null) => plantation ?? "[участок, площадь, высота]";
