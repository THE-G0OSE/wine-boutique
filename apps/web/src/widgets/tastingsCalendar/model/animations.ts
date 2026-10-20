import type { Variants } from "motion/react";

/** Содержимое панели дня сменяется мягко: афиша → форма → приглашение */
export const panelSwap: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] } },
};
