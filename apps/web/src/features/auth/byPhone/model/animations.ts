import type { Variants } from "motion/react";

/** Шаги входа сменяются сдвигом: номер → код → знакомство → карта */
export const stepSwap: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};
