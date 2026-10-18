import type { Transition, Variants } from "motion/react";

/** Мобильный конверт: письмо выскальзывает из-под него вниз */
export const letterSlide: Variants = {
  hidden: { opacity: 0, y: -60 },
  shown: { opacity: 1, y: 0 },
};

export const letterSlideTransition: Transition = { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] };
