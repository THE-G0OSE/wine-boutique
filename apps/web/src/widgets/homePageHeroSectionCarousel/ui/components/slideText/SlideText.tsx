import type { imageObj } from "@/entities/heroPageImages";
import { cn } from "@/shared/lib/cn";
import { stage, stageFont } from "@/shared/lib/stage";
import { AnimatePresence, motion } from "motion/react";
import type { FC } from "react";
import { Eyebrow, Text } from "uikit;/";
import { textContainerVariants, textItemVariants } from "../../../model/animations";
import { HERO_LAYOUT } from "../../../model/layout";

interface IProps {
  slide: imageObj;
  variant: "desktop" | "mobile";
  /** Объявлять смену слайда скринридеру (только когда автопрокрутка на паузе) */
  announce: boolean;
}

/** Подпись вида вина, заголовок и описание активного слайда */
const SlideText: FC<IProps> = ({ slide, variant, announce }) => {
  const isDesktop = variant === "desktop";
  const { text } = HERO_LAYOUT;

  return (
    <div
      aria-live={announce ? "polite" : "off"}
      className={cn(isDesktop ? "absolute z-10" : "relative")}
      style={isDesktop ? { left: stage(text.left), top: stage(text.top), width: stage(text.width) } : undefined}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          variants={textContainerVariants}
          initial="hide"
          animate="show"
          exit="hide"
          className={cn("flex flex-col", isDesktop ? "gap-2" : "gap-2.5")}
        >
          <motion.div variants={textItemVariants}>
            <Eyebrow
              tone="wine"
              direction={isDesktop ? "column" : "row"}
              size={isDesktop ? "lg" : "sm"}
              className={cn(isDesktop && "gap-2.25")}
            >
              <span style={isDesktop ? { fontSize: stageFont(24, 18) } : undefined}>{slide.additional}</span>
            </Eyebrow>
          </motion.div>
          <Text
            as="h1"
            FONT="FIRM"
            variants={textItemVariants}
            className={cn("whitespace-pre-line text-white", !isDesktop && "text-[52px] leading-[70px]")}
            style={isDesktop ? { fontSize: stageFont(96, 56), lineHeight: 140 / 96 } : undefined}
          >
            {slide.title}
          </Text>
          <Text
            COLOR="MUTED"
            variants={textItemVariants}
            className={cn("whitespace-pre-line", isDesktop ? "mt-3.5 leading-[1.4]" : "text-sm leading-[1.55]")}
            style={isDesktop ? { fontSize: stageFont(20, 16) } : undefined}
          >
            {slide.content}
          </Text>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SlideText;
