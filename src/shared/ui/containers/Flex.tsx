import { motion } from "motion/react"
import type { FC, HTMLProps, ReactNode } from "react"

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
    <div className={`flex ${end && "justify-end"} ${center && "justify-center items-center"} ${fullHeight && "h-full"} ${fullWidth && "w-full"} ${fullSize && "w-full h-full"} ${between && "justify-between items-center"} ${column && "flex-col"}  ${className}`} {...props}>
        {children}
    </div>
  )
}

const AnimatedFlex = motion.create(Flex)

export default AnimatedFlex