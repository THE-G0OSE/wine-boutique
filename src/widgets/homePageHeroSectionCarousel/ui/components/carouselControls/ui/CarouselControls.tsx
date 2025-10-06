import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { Flex } from "uikit;/";
import {motion} from 'motion/react'
import type { FC } from "react";
import { leftButtonInnerVariants, leftButtonVariants, rightButtonInnerVariants, rightButtonVariants } from "../model/animations";
import ProgressBar from "@/widgets/homePageHeroSectionCarousel/ui/components/carouselControls/ui/ProgressBar";

interface IProps {
    prevHandler: () => void;
    nextHandler: () => void;
    progress: number 
}

const CarouselControls: FC<IProps> = ({prevHandler, nextHandler, progress}) => {
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
      </Flex> 
  )
}

export default CarouselControls