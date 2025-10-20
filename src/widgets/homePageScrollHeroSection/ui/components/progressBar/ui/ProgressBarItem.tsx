import type { ScrollCard } from "@/entities/heroPageScrollCards"
import { useScroll, useSpring, useTransform } from "motion/react"
import type { FC } from "react"
import {motion} from "motion/react"

interface IProps {
    card: ScrollCard
    color: string
}

const ProgressBarItem: FC<IProps> = ({card, color}) => {
  const {scrollY} = useScroll()
  const widthValue = useTransform(scrollY, [card.scrollFrom, card.scrollTo], ["0%", "100%"])
  const width = useSpring(widthValue, {stiffness: 50})
  return (
    <motion.div style={{width}} className={'h-full absolute ' + color}/>
  )
}

export default ProgressBarItem