import type { ScrollCard } from "@/entities/heroPageScrollCards/model/types";
import type { FC } from "react";
import { motion, type MotionValue } from "motion/react";
import {
  bottleVariants,
  paperVariants,
  textBodyVariants,
  textTitleVariants,
} from "@/entities/heroPageScrollCards/model/animations";
import { centerStoryLayout } from "@/entities/heroPageScrollCards/model/lib/layout";
import { Text } from "uikit;/";
import { cn } from "@/shared/lib/cn";
import { stage, stageFont } from "@/shared/lib/stage";
import { asset } from "@/shared/lib/asset";

interface IProps {
  card: ScrollCard;
  isActive: boolean;
  /** Лёгкое «покачивание» бумаги и бутылки от скорости прокрутки */
  floatY: MotionValue<number>;
}

const box = (x: number, dy: number, width: number, height?: number) => ({
  left: stage(x),
  top: `calc(50% + ${stage(dy)})`,
  width: stage(width),
  height: height === undefined ? undefined : stage(height),
});

/**
 * История на липком экране (десктоп): координаты из макета, группа по центру экрана.
 * Неактивные истории уезжают за край, но остаются в DOM — скринридер читает все пять.
 */
const ScrollCardElement: FC<IProps> = ({ card, isActive, floatY }) => {
  const layout = centerStoryLayout(card);
  const state = isActive ? "show" : "hide";
  const textAlign = card.side === "right" ? "text-left" : "text-right";

  return (
    <div className={cn("absolute inset-0", !isActive && "pointer-events-none")}>
      {/* will-change: слои с крупными drop-shadow — на GPU, тень не перерисовывается на каждом кадре сдвига */}
      <motion.div aria-hidden="true" className="absolute inset-0 will-change-transform" style={{ y: floatY }}>
        <motion.img
          src={asset("/images/textures/ripped-paper.webp")}
          alt=""
          variants={paperVariants(card.side)}
          initial="hide"
          animate={state}
          className="absolute max-w-none object-fill drop-shadow-[73px_35px_50px_rgba(0,0,0,0.3)] will-change-transform"
          style={box(layout.paper.x, layout.paper.dy, layout.paper.width, layout.paper.height)}
        />
        <motion.img
          src={card.image}
          alt=""
          variants={bottleVariants(card.side)}
          initial="hide"
          animate={state}
          className="absolute max-w-none object-contain drop-shadow-[8px_32px_26px_rgba(0,0,0,0.3)] will-change-transform"
          style={box(layout.bottle.x, layout.bottle.dy, layout.bottle.width, layout.bottle.height)}
        />
      </motion.div>
      <Text
        as="h2"
        FONT="FIRM"
        COLOR="MUTED"
        variants={textTitleVariants}
        initial="hide"
        animate={state}
        className={cn("absolute text-shadow-2xl", textAlign)}
        style={{ ...box(layout.title.x, layout.title.dy, layout.title.width), fontSize: stageFont(96, 56), lineHeight: 140 / 96 }}
      >
        {card.title}
      </Text>
      <Text
        COLOR="MUTED"
        variants={textBodyVariants}
        initial="hide"
        animate={state}
        className={cn("absolute text-shadow-xl", textAlign)}
        style={{ ...box(layout.body.x, layout.body.dy, layout.body.width), fontSize: stageFont(24, 18), lineHeight: 1.35 }}
      >
        {card.body}
      </Text>
    </div>
  );
};

export default ScrollCardElement;
