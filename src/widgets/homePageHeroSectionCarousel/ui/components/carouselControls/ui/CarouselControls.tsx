import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { Flex, Text } from "uikit;/";
import {motion, useSpring, useTransform} from 'motion/react'
import { useEffect, type FC } from "react";
import { leftButtonInnerVariants, leftButtonVariants, rightButtonInnerVariants, rightButtonVariants } from "../model/animations";
import ProgressBar from "@/widgets/homePageHeroSectionCarousel/ui/components/carouselControls/ui/ProgressBar";
import { imageMock } from "@/entities/heroPageImages";

interface IProps {
    prevHandler: () => void;
    nextHandler: () => void;
    progress: number 
    index: number
}

const CarouselControls: FC<IProps> = ({prevHandler, nextHandler, progress, index}) => {

  const indexSpring = useSpring(0)
  useEffect(() => {
    indexSpring.set(index)
  }, [index])
  const y = useTransform(indexSpring, [0, 10], ["6rem", "-54rem"])

  return (
    <Flex center className="right-[0] bottom-[70px] absolute gap-5 pr-3 w-[1060px] h-30">
        <motion.button onClick={prevHandler} variants={leftButtonVariants} initial="hide" animate="show" whileHover="hover" whileTap="tap" className="box-border border-[#fff] border-3 rounded-full h-full aspect-square">
          <Flex fullSize center>
            <motion.div variants={leftButtonInnerVariants}>
              <MdKeyboardArrowLeft color="white" size={60} />
            </motion.div>
          </Flex>
        </motion.button>
        <motion.button onClick={nextHandler} variants={rightButtonVariants} initial="hide" animate="show" whileHover="hover" whileTap="tap" className="box-border border-[#fff] border-3 rounded-full h-full aspect-square">
          <Flex fullSize center>
            <motion.div variants={rightButtonInnerVariants}>
              <MdKeyboardArrowRight color="white" size={60} />
            </motion.div>
          </Flex>
        </motion.button>
        <ProgressBar progress={progress} />  
        <Flex center className="relative mr-2 w-30 h-24 overflow-hidden -translate-y-3 shrink-0">
          <motion.div className="top-0 absolute flex flex-col" style={{y}}>
            {imageMock.map((_, index) => (
                <Flex center className="size-24"><Text FONT="FIRM" COLOR="WHITE" SIZE="FIRM">0{index + 1}</Text></Flex>
            ))}
          </motion.div>
        </Flex>
      </Flex> 
  )
}

export default CarouselControls