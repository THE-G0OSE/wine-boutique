import { HeroPageImage, imageMock, type imageObj } from "@/entities/heroPageImages";
import { useCarousel } from "../model/lib/hooks/useCarousel";
import CarouselControls from "./components/carouselControls/ui/CarouselControls";
import { AnimatePresence, motion } from "motion/react";
import { Flex } from "uikit;/";
import { setTheme } from "@/shared/model/appSlice";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";

const HomePageHeroSectionCarousel = () => {
  const dispatch = useAppDispatch()
  const { carouselArr, prevHandler, nextHandler, progress } = useCarousel<imageObj>({
    arr: imageMock,
    showingNumber: 7,
    autoChangeTimer: 5,
    changeCooldown: 1.5,
    onChange: (image) => {dispatch(setTheme(image.theme))}
  });
  return (
    <>
      <Flex column fullSize>
        <motion.div>
          <AnimatePresence>
            {carouselArr.map((image, index) => (
              <HeroPageImage key={image.path} image={image} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </Flex>
      <CarouselControls progress={progress} prevHandler={prevHandler} nextHandler={nextHandler} />
    </>
  );
};

export default HomePageHeroSectionCarousel;
