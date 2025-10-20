import { cardsMock } from "@/entities/heroPageScrollCards";
import { motion } from "motion/react";
import {ScrollCardElement} from "@/entities/heroPageScrollCards";
import {ScrollHeroSectionProgressBar} from "./components/progressBar";
import { useScrollHeroSection } from "../model";

const HomePageScrollHeroSection = () => {
  const { positionClassName, isProgressBarShowen, yOffset, scrollY } =
    useScrollHeroSection(40);

  return (
    <div className="relative h-[600vh]">
      <motion.div
        className={` ${positionClassName} bg-[url(/images/wooden-back.jpg)] bg-repeat shadow-top-sm w-screen overflow-hidden h-screen bg-size-[20rem] `}
      >
        {/* [x]: add progress bar */}
        <ScrollHeroSectionProgressBar
          y={yOffset}
          isOpen={isProgressBarShowen}
        />
        {cardsMock.map((card) => (
          <ScrollCardElement
            y={yOffset}
            key={card.image + "-scroll-card"}
            card={card}
            scroll={scrollY}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default HomePageScrollHeroSection;
