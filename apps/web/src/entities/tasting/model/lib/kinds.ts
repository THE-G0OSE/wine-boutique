import type { TastingKind } from "../types";

interface IKindMeta {
  label: string;
  /** Заливка метки в календаре и бирки типа */
  fill: string;
  /** Верхняя черта карточки формата */
  edge: string;
}

/** Типы дегустаций в порядке легенды: подпись и цвет метки (токены — app/model/styles/colors.css) */
export const TASTING_KINDS: Record<TastingKind, IKindMeta> = {
  vertical: { label: "Вертикаль", fill: "bg-amber-350", edge: "border-t-amber-350" },
  blind: { label: "Слепая", fill: "bg-secondary-200", edge: "border-t-secondary-200" },
  dinner: { label: "Гастроужин", fill: "bg-primary-200", edge: "border-t-primary-200" },
  masterclass: { label: "Мастер-класс", fill: "bg-sage", edge: "border-t-sage" },
};

export const TASTING_KIND_ORDER = Object.keys(TASTING_KINDS) as TastingKind[];

export const isTastingKind = (value: string): value is TastingKind => value in TASTING_KINDS;
