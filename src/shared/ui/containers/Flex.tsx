import { motion } from "motion/react"
import type { FC, HTMLProps, ReactNode } from "react"
import { cn } from "@/shared/lib/cn"

interface IProps extends HTMLProps<HTMLDivElement> {
    children: ReactNode,
    center?: boolean,
    between?: boolean,
    end?: boolean,
    column?: boolean,
    fullSize?: boolean,
    fullHeight?: boolean,
    fullWidth?: boolean,
}

const Flex: FC<IProps> = ({end = false, fullHeight = false, fullWidth = false, fullSize = false, center = false, between = false, column = false, className, children, ...props}) => {
  return (
    <div
      className={cn("flex", {
        "justify-end": end,
        "justify-center items-center": center,
        "h-full": fullHeight,
        "w-full": fullWidth,
        "w-full h-full": fullSize,
        "justify-between items-center": between,
        "flex-col": column,
      }, className)}
      {...props}
    >
        {children}
    </div>
  )
}

const AnimatedFlex = motion.create(Flex)

export default AnimatedFlex
