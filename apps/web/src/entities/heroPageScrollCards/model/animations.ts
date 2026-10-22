import type { ScrollSide } from "@/entities/heroPageScrollCards/model/types";
import { type Variants } from "motion/react";

const spring = (delay = 0) => ({ type: "spring", stiffness: 70, damping: 16, delay }) as const;

/** Бумага въезжает со своей стороны экрана */
export const paperVariants = (side: ScrollSide): Variants => ({
  hide: { x: side === "left" ? -1000 : 1000, transition: spring() },
  show: { x: 0, transition: spring(0.2) },
});

/** Бутылка — чуть позже бумаги и с меньшего расстояния */
export const bottleVariants = (side: ScrollSide): Variants => ({
  hide: { x: side === "left" ? -600 : 600, opacity: 0, transition: spring() },
  show: { x: 0, opacity: 1, transition: spring(0.35) },
});

export const textTitleVariants: Variants = {
  hide: { y: 100, opacity: 0, transition: { type: "spring", stiffness: 100, damping: 18 } },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 18, delay: 0.6 } },
};

export const textBodyVariants: Variants = {
  hide: { y: 100, opacity: 0, transition: { type: "spring", stiffness: 100, damping: 18 } },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 18, delay: 0.8 } },
};
