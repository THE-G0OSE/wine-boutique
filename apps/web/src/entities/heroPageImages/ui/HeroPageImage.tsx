import type { imageObj } from "@/entities/heroPageImages/model";
import {
  captionVariants,
  slideShadow,
  slideTransition,
  type SlideBox,
} from "@/entities/heroPageImages/model/animations";
import { AnimatePresence, motion } from "motion/react";
import type { FC } from "react";

interface IProps {
  image: imageObj;
  /** Позиция в карусели: 0 — фон, дальше — карточки */
  index: number;
  initial: SlideBox;
  animate: SlideBox;
  exit: SlideBox;
  /** Масштаб сцены (ширина секции / 1920) — для подписи карточки */
  scale: number;
}

/** Слайд hero: активный растянут на весь экран, остальные — карточки с подписью */
const HeroPageImage: FC<IProps> = ({ image, index, initial, animate, exit, scale }) => {
  const isBackground = index === 0;
  const transition = slideTransition(index);

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className="absolute overflow-hidden"
    >
      <motion.img
        src={image.path}
        alt=""
        draggable={false}
        initial={false}
        animate={{ filter: isBackground ? "brightness(0.72)" : "brightness(1)" }}
        transition={transition}
        className="size-full object-cover"
      />
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ boxShadow: isBackground ? slideShadow.background : slideShadow.card }}
        transition={transition}
        className="pointer-events-none absolute inset-0"
      />
      <AnimatePresence>
        {!isBackground && (
          <motion.div
            key="caption"
            variants={captionVariants}
            initial="hide"
            animate="show"
            exit="hide"
            className="absolute flex flex-col"
            style={{ left: 27 * scale, right: 20 * scale, bottom: 26 * scale, gap: 6 * scale }}
          >
            <span aria-hidden="true" className="h-px w-[15px] bg-white" />
            <span className="text-neutral-350" style={{ fontSize: Math.max(10, 12 * scale) }}>
              {image.additional}
            </span>
            <span
              className="font-firm whitespace-pre-line text-white"
              style={{ fontSize: Math.max(14, 22 * scale), lineHeight: 32 / 22 }}
            >
              {image.title.replace("\n", "")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HeroPageImage;
