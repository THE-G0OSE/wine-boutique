import type { ScrollCard } from "@/entities/heroPageScrollCards/model/types";
import { useEffect, useRef, useState, type FC, memo } from "react";
import { motion, MotionValue } from "motion/react";
import {
  scrollCardInnerVariants,
  scrollCardVariants,
  textBodyVariants,
  textTitleVariants,
} from "@/entities/heroPageScrollCards/model/animations";
import { Text } from "uikit;/";

interface IProps {
  card: ScrollCard;
  scroll: MotionValue;
}

const ScrollCardElement: FC<IProps> = ({ card, scroll }) => {
  console.log("CHILD RENDER");
  const [animationState, setAnimationState] = useState<"hide" | "show">("hide");
  const lastState = useRef<"hide" | "show">("hide");

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = scroll.on("change", (value) => {
      if (timeout) return;
      timeout = setTimeout(() => {
        const newState =
          value > card.scrollFrom && value < card.scrollTo ? "show" : "hide";
        if (newState !== lastState.current) {
          lastState.current = newState;
          setAnimationState(newState);
        }
        timeout = null;
      }, 50);
    });
    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <motion.div
        variants={scrollCardVariants(card)}
        initial="hide"
        animate={animationState}
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
      <Text variants={textTitleVariants} initial="hide" animate={animationState} FONT="FIRM" SIZE="FIRM" COLOR="WHITE" className={`absolute text-shadow-2xl w-248 ${card.side === 'left' ? "right-10" : "left-10"} top-60`}>
        {card.title}
      </Text>
      <Text variants={textBodyVariants} initial="hide" animate={animationState} FONT="REGULAR" STYLE="SEMIBOLD" COLOR="WHITE" SIZE="H3" className={`absolute text-shadow-xl w-190 ${card.side === 'left' ? "right-40" : "left-40"} top-125`}>{card.body}</Text>
    </>
  );
};

export default memo(ScrollCardElement);
