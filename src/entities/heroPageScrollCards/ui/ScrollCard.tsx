import type { ScrollCard } from "@/entities/heroPageScrollCards/model/types";
import { useEffect, type FC } from "react";
import { motion, MotionValue, useMotionValue } from "motion/react";
import {
  scrollCardInnerVariants,
  scrollCardVariants,
  textBodyVariants,
  textTitleVariants,
} from "@/entities/heroPageScrollCards/model/animations";
import { Text } from "uikit;/";
import { useMotionChange } from "@/shared/lib/hooks/useMotionChange";

interface IProps {
  card: ScrollCard;
  scroll: MotionValue;
  y: MotionValue<number>
}

const ScrollCardElement: FC<IProps> = ({ card, scroll, y }) => {
  const animationState = useMotionChange<number, "hide" | "show">(
    scroll,
    (value) =>
      value > card.scrollFrom && value < card.scrollTo ? "show" : "hide",
    scroll.get() > card.scrollFrom && card.scrollTo > scroll.get() ? "show" : "hide",
    50
  );
  const cardY = useMotionValue<number>(0)
  useEffect(() => {
    const unsubscribe = y.on("change", (value) => cardY.set(-value + card.vertOffset))
    return unsubscribe
  })

  return (
    <>
      <motion.div
        variants={scrollCardVariants(card)}
        initial="hide"
        animate={animationState}
        style={{y: cardY}}
        className={`absolute bg-[url(/images/ripped-paper.png)] bg-cover ${
          card.side === "left" ? "-left-10" : "-right-40"
        } w-240 h-127`}
      >
        <motion.img
          src={card.image}
          variants={scrollCardInnerVariants(card)}
          initial="hide"
          animate={animationState}
          className={`absolute ${
            card.side === "left" ? "-right-10" : "-left-30"
          }`}
        />
        {/*[x]: add animated text */}
      </motion.div>
      <Text
        variants={textTitleVariants}
        initial="hide"
        animate={animationState}
        FONT="FIRM"
        SIZE="FIRM"
        COLOR="WHITE"
        className={`absolute text-shadow-2xl w-248 ${
          card.side === "left" ? "right-10" : "left-10"
        } top-60`}
      >
        {card.title}
      </Text>
      <Text
        variants={textBodyVariants}
        initial="hide"
        animate={animationState}
        FONT="REGULAR"
        STYLE="SEMIBOLD"
        COLOR="WHITE"
        SIZE="H3"
        className={`absolute text-shadow-xl w-190 ${
          card.side === "left" ? "right-40" : "left-40"
        } top-125`}
      >
        {card.body}
      </Text>
    </>
  );
};

export default ScrollCardElement;
