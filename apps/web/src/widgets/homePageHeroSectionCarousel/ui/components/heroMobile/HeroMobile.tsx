import type { imageObj } from "@/entities/heroPageImages";
import { AnimatePresence, motion } from "motion/react";
import type { FC } from "react";
import { srcSet } from "@/shared/lib/srcSet";
import type { HeroCarousel } from "../../../model/types";
import ProgressBar from "../carouselControls/ui/ProgressBar";
import SlideCounter from "../carouselControls/ui/SlideCounter";
import SlideText from "../slideText/SlideText";

interface IProps {
  carousel: HeroCarousel;
  items: imageObj[];
}

/** Мобильная версия: фон меняется по таймеру, остальные слайды — лента карточек, по тапу открывается слайд */
const HeroMobile: FC<IProps> = ({ carousel, items }) => {
  const { active } = carousel;

  return (
    <div className="absolute inset-0 flex flex-col">
      <AnimatePresence initial={false}>
        <motion.img
          key={active.id}
          src={active.path}
          alt=""
          fetchPriority="high"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 size-full object-cover object-[62%_50%]"
        />
      </AnimatePresence>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.2)_35%,rgba(17,12,10,0.95)_100%)]"
      />

      <div className="relative px-5 pt-35">
        <SlideText slide={active} variant="mobile" announce={carousel.isPaused} />
      </div>

      <div className="absolute inset-x-0 bottom-18 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none]">
        {carousel.ordered.slice(1).map((slide) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => carousel.goTo(items.indexOf(slide))}
            aria-label={`Показать слайд: ${slide.title.replace("\n", "")}`}
            className="relative h-59 w-44 shrink-0 cursor-pointer snap-start overflow-hidden rounded-[10px] border-0 p-0 text-left"
          >
            {/* Карточка 176×236 режет кадр 16:9 по высоте — нужна ширина ~420 px */}
            <img
              src={slide.path}
              srcSet={srcSet(slide.path, [640, 960], 1920)}
              sizes="420px"
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
            <span aria-hidden="true" className="absolute inset-0 shadow-[inset_0_-50px_30px_0_rgba(0,0,0,0.75)]" />
            <span className="absolute right-3 bottom-4 left-4 flex flex-col gap-1">
              <span className="text-[11px] text-neutral-350">{slide.additional}</span>
              <span className="font-firm text-[17px] leading-6 text-white">{slide.title.replace("\n", "")}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="absolute inset-x-5 bottom-9 flex items-center gap-3">
        <ProgressBar
          activeIndex={carousel.activeIndex}
          count={carousel.count}
          progress={carousel.progress}
          className="flex-1 bg-white/30"
        />
        <SlideCounter activeIndex={carousel.activeIndex} count={carousel.count} className="text-[28px]" />
      </div>
    </div>
  );
};

export default HeroMobile;
