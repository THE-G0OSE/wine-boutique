import type { ScrollCard } from "@/entities/heroPageScrollCards/model/types";
import { storyInViewVariants } from "@/entities/heroPageScrollCards/model/animations";
import { motion } from "motion/react";
import type { FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  card: ScrollCard;
}

/** История в мобильной ленте (MHome): бумага с бутылкой у края, текст напротив */
const StoryCard: FC<IProps> = ({ card }) => {
  const textRight = card.side === "left";

  return (
    <motion.article
      variants={storyInViewVariants}
      initial="hide"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="relative h-[470px]"
    >
      <img
        src="/images/textures/ripped-paper.webp"
        alt=""
        loading="lazy"
        className={cn(
          "absolute top-[150px] h-[210px] w-[420px] max-w-none object-fill drop-shadow-[20px_14px_22px_rgba(0,0,0,0.35)]",
          textRight ? "-left-30" : "-right-30"
        )}
      />
      <img
        src={card.image}
        alt=""
        loading="lazy"
        className={cn(
          "absolute top-30 h-55 w-[230px] object-contain drop-shadow-[6px_18px_14px_rgba(0,0,0,0.35)]",
          textRight ? "left-0" : "right-0"
        )}
      />
      <h2
        className={cn(
          "absolute inset-x-5 top-5 m-0 font-firm text-[34px] leading-12 font-normal text-paper text-shadow-[8px_10px_3px_rgba(0,0,0,0.4)]",
          textRight && "text-right"
        )}
      >
        {card.title}
      </h2>
      <p
        className={cn(
          "absolute top-90 m-0 text-sm leading-[1.45] text-paper/90 text-shadow-[6px_6px_3px_rgba(0,0,0,0.4)]",
          textRight ? "right-5 left-[150px] text-right" : "right-[150px] left-5"
        )}
      >
        {card.body}
      </p>
    </motion.article>
  );
};

export default StoryCard;
