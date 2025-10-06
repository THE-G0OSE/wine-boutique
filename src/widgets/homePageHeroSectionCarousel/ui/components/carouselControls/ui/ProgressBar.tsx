import { useEffect, type FC } from "react"
import {motion, useMotionValue, useTransform} from 'motion/react'
import { useAppSelector } from "@/shared/lib/hooks/useAppSelctore"
import { appSelection } from "@/shared/model/appSlice"

interface IProps {
    progress: number
}

const ProgressBar: FC<IProps> = ({progress}) => {

    const progressValue = useMotionValue(0)

    const {theme} = useAppSelector(appSelection)

    useEffect(() => {
        progressValue.setWithVelocity(progressValue.get(), progress, 1)
    }, [progress])

    const width = useTransform(progressValue, [0, 85, 100], ["0%", "100%", "0%"])
    const x = useTransform(progressValue, [0, 85, 100], ["0%", "0%", "100%"])

  return (
    <div className="relative bg-white rounded-full w-full h-3 overflow-hidden">
        <motion.div className={`${theme === "red" ? "bg-primary-200" : "bg-secondary-200" } rounded-full h-full`} style={{x, width}}/>
    </div>
  )
}

export default ProgressBar