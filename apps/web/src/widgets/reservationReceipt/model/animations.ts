import type { Variants } from "motion/react";

/** Чек «выползает» из принтера сверху (Success: wbPrint) */
export const printIn: Variants = {
  hidden: { y: -60, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] } },
};
