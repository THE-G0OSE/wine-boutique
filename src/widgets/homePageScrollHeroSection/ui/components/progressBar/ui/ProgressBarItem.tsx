import { motion, useSpring, useTransform, type MotionValue } from "motion/react"
import type { FC } from "react"
import { cn } from "@/shared/lib/cn"

interface IProps {
    index: number
    count: number
    /** Прогресс всей секции, 0→1 */
    progress: MotionValue<number>
    className: string
}

/** Сегмент полосы: заполняется, пока на экране его история */
const ProgressBarItem: FC<IProps> = ({ index, count, progress, className }) => {
  const widthValue = useTransform(progress, [index / count, (index + 1) / count], ["0%", "100%"])
  const width = useSpring(widthValue, { stiffness: 50 })
  return (
    <div className="relative h-full flex-1 overflow-hidden">
      <motion.div style={{ width }} className={cn("absolute inset-y-0 left-0", className)} />
    </div>
  )
}

export default ProgressBarItem
