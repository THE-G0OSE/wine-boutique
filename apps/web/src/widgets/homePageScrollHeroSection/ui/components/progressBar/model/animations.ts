import type { Variants } from "motion/react";

export const progressBarVar: Variants = {
    hide: {
        y: -200,
        transition: {
            duration: 1,
            type: "spring",
            stiffness: 100,
        }
    },
    show: {
        y: 0,
        transition: {
            duration: 1,
            type: "spring",
            stiffness: 100
        }
    }
}