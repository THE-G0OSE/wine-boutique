import type { Variants } from "motion/react"

const spring = { duration: .2, type: "spring", stiffness: 100 } as const

export const leftButtonInnerVariants: Variants = {
  show: { x: -5, transition: spring },
  hover: { x: -15, transition: spring },
  tap: { x: -20, transition: spring },
}

export const rightButtonInnerVariants: Variants = {
  show: { x: 5, transition: spring },
  hover: { x: 15, transition: spring },
  tap: { x: 20, transition: spring },
}

const buttonVariants: Variants = {
  show: { borderColor: "#FFFFFF", transition: spring },
  hover: { borderColor: "#D0D0D0", transition: spring },
  tap: { borderColor: "#8A8A8A", transition: spring },
}

export const leftButtonVariants = buttonVariants
export const rightButtonVariants = buttonVariants
