import { stagger, type Variants } from "motion/react";

/** Текст активного слайда: подпись, заголовок и описание всплывают по очереди */
export const textContainerVariants: Variants = {
  show: {
    transition: { delayChildren: stagger(0.3, { startDelay: 0.5 }) },
  },
  hide: {
    transition: { staggerChildren: 0.05 },
  },
};

export const textItemVariants: Variants = {
  hide: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};
