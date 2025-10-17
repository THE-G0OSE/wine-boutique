import type { ScrollCard } from "@/entities/heroPageScrollCards/model/types";
import { type Variants } from "motion/react";

export const scrollCardVariants = (card: ScrollCard): Variants => ({
  hide: {
    y: card.vertOffset,
    x: card.side === "left" ? -1000 : 1000,
    transition: { duration: 1, type: "spring", stiffness: 70 },
  },
  show: {
    y: card.vertOffset,
    x: 0 + card.horOffset,
    transition: {
      duration: 1,
      type: "spring",
      stiffness: 70,
      delay: .2
    },
  },
});

export const scrollCardInnerVariants = (card: ScrollCard): Variants => ({ hide: {
    y: card.imageVertOffset,
    x: card.side === "left" ? -500 : 500,
    transition: { duration: 1.3, type: "spring", stiffness: 70 },
  },
  show: {
    y: card.imageVertOffset,
    x: 0 + card.imageHorOffset,
    transition: { duration: 1.3, type: "spring", stiffness: 70, delay: .3 },
  },
});

export const textTitleVariants: Variants =  {
  hide: {
    y: 100,
    opacity: 0,
    transition: { duration: 1, type: "spring", stiffness: 100, delay: .2}
  },
  show: {
    y: 0, 
    opacity: 1,
    transition: { duration: 1, type: "spring", stiffness: 100, delay: .7}
  }
}

export const textBodyVariants: Variants = {
  hide: {
    y: 100,
    opacity: 0,
    transition: { duration: 1, type: "spring", stiffness: 100}
  },
  show: {
    y: 0,
    opacity: 1,
    transition :{duration: 1, type: "spring", stiffness: 100, delay: .9}
  }
}
