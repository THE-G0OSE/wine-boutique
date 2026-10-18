/** Ширина макета, на котором нарисованы арт-секции главной */
export const DESIGN_WIDTH = 1920;

/**
 * Переводит координату из макета 1920 в долю ширины «сцены» (`--stage` в base.css).
 * Секция-родитель должна быть `@container`: тогда макет пропорционально сжимается вместе с ней.
 *
 * @example style={{ left: stage(866), width: stage(254) }}
 */
export const stage = (px: number) => `calc(${px} / ${DESIGN_WIDTH} * var(--stage))`;

/** Размер шрифта, который сжимается со сценой, но не меньше `min` px */
export const stageFont = (px: number, min: number) => `clamp(${min}px, ${stage(px)}, ${px}px)`;
