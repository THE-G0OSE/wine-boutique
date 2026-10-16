import type { Transition, Variants } from "motion/react";

/** Геометрия слайда в пикселях секции: фон на весь экран или карточка в ряду (type, не interface: motion ждёт индексную сигнатуру) */
export type SlideBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: number;
  scale?: number;
  opacity?: number;
};

/** Тени фона (сверху — под шапку, снизу — подложка) и карточки (снизу — под подпись). Число теней совпадает, чтобы motion их интерполировал */
export const slideShadow = {
  background: "inset 0 -104px 33px -8px rgba(0,0,0,0.25), inset 0 100px 80px 0 rgba(0,0,0,0.67)",
  card: "inset 0 -61px 37px 0 rgba(0,0,0,0.73), inset 0 0 0 0 rgba(0,0,0,0)",
};

export const slideTransition = (index: number): Transition => ({
  delay: 0.02 * index,
  duration: 0.8,
  ease: [0.9, 0, 0.3, 0.7],
});

export const captionVariants: Variants = {
  hide: { opacity: 0, y: 10, transition: { duration: 0.3, ease: "easeInOut" } },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut", delay: 0.5 } },
};
