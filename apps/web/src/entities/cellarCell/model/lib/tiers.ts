import { plural } from "@/shared/lib/plural";
import type { CellarTerm, CellarTier } from "../types";

interface ITierMeta {
  /** «Средняя ячейка» — карточка выбранной */
  title: string;
  /** «Средние» — вкладка ряда на мобильных */
  group: string;
  /** Ряд стены словами */
  row: string;
}

/** Размеры ячеек сверху вниз (макеты CellarStorage и MCellarStorage) */
export const CELLAR_TIERS: Record<CellarTier, ITierMeta> = {
  small: { title: "Малая ячейка", group: "Малые", row: "верхний" },
  medium: { title: "Средняя ячейка", group: "Средние", row: "средний" },
  large: { title: "Большая ячейка", group: "Большие", row: "нижний" },
};

export const CELLAR_TIER_ORDER = Object.keys(CELLAR_TIERS) as CellarTier[];

/** Сроки хранения и скидка за срок */
export const CELLAR_TERMS: { id: CellarTerm; label: string; note: string }[] = [
  { id: "3m", label: "3 мес", note: "пробно" },
  { id: "1y", label: "1 год", note: "−10%" },
  { id: "3y", label: "3 года", note: "−20%" },
];

export const isCellarTerm = (value: string): value is CellarTerm => CELLAR_TERMS.some((term) => term.id === value);

/** «до 24 бутылок» */
export const formatCapacity = (capacity: number) => `до ${capacity} ${plural(capacity, ["бутылки", "бутылок", "бутылок"])}`;
