import type { Variants } from "motion/react";

/** Мебель на чертеже сменяется проявлением — будто перерисовали лист */
export const planSwap: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.15 } },
  visible: { opacity: 1, transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] } },
};
