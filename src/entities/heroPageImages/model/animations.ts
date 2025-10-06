import { stagger, type Transition, type Variants } from "motion/react";

export const imageVariants = (index: number): Variants => ({
  back: {
    right: "0",
    x: 0,
    width: "100%",
    height: "100%",
    scale: 1.2,
    borderRadius: "0px",
    bottom: "0"
  },
  first: {
    right: "0",
    x: 0,
    width: "100%",
    height: "100%",
    scale: 1,
    borderRadius: "0px",
    bottom: "0"
  },
  other: {
    right: "0",
    bottom: "250px",
    x: -800 + (index - 1) * 260,
    width: 240,
    height: 350,
    scale: 1,
    borderRadius: "10px",
    boxShadow: "10px 10px 10px 0 rgba(0, 0, 0, .7)",
  },
});

export const textVariants: Variants = {
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

export const textContainerVar: Variants = {
  show: {
    transition: { delayChildren: stagger(0.3, { startDelay: 0.5 }) },
  },
};

export const shadowVariants: Variants = {
  first: { boxShadow: "inset 0 100px 80px 0 rgba(0, 0, 0, .67)" },
  other: { boxShadow: "inset 0 -50px 45px 0 rgba(0, 0, 0, .73)" },
};

export const innerVariants: Variants = {
  first: { filter: "brightness(.65)" },
  others: { filter: "brightness(1)" },
};

export const transition = (index: number): Transition => ({
  delay: 0.02 * index,
  duration: 0.8,
  ease: [0.9, 0, 0.3, 0.7],
});