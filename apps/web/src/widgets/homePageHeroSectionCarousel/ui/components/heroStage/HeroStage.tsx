import { HeroPageImage } from "@/entities/heroPageImages";
import { useElementSize } from "@/shared/lib/hooks/useElementSize";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import type { FC } from "react";
import { captionScale, getHeroGeometry, HERO_LAYOUT, slideBox, slideEnterBox, slideExitBox } from "../../../model/layout";
import type { HeroCarousel } from "../../../model/types";
import CarouselControls from "../carouselControls/ui/CarouselControls";
import SlideText from "../slideText/SlideText";

interface IProps {
  carousel: HeroCarousel;
  /** Телефон: карточки внизу в портретной раскладке, текст сверху, листание свайпом */
  compact: boolean;
}

/** Свайп короче — случайное касание при прокрутке страницы */
const SWIPE = 60;

/**
 * Сцена hero (десктоп и телефон): активный слайд — фон на весь экран, следующие — ряд карточек;
 * при листании карточка разворачивается в фон. Геометрия — в пикселях секции, чтобы motion плавно её анимировал.
 */
const HeroStage: FC<IProps> = ({ carousel, compact }) => {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const geometry = getHeroGeometry(size.width, size.height, compact);
  const visible = carousel.ordered.slice(0, HERO_LAYOUT.visibleSlides);

  const onPanEnd = (_: PointerEvent, { offset }: PanInfo) => {
    if (Math.abs(offset.x) < SWIPE || Math.abs(offset.x) < Math.abs(offset.y)) return;
    if (offset.x < 0) carousel.next();
    else carousel.prev();
  };

  return (
    <motion.div
      ref={ref}
      onPanEnd={compact ? onPanEnd : undefined}
      // Вертикальная прокрутка страницы остаётся за браузером, горизонтальный жест — листание
      style={compact ? { touchAction: "pan-y" } : undefined}
      className="@container absolute inset-0"
    >
      {size.width > 0 && (
        <AnimatePresence initial={false}>
          {visible.map((slide, index) => (
            <HeroPageImage
              key={slide.id}
              image={slide}
              index={index}
              initial={slideEnterBox(index, geometry)}
              animate={slideBox(index, geometry)}
              exit={slideExitBox(index, geometry)}
              scale={captionScale(geometry)}
            />
          ))}
        </AnimatePresence>
      )}
      {compact ? (
        <>
          {/* Текст поверх фото: сверху темнее — читается на любом кадре */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-3/5 bg-linear-to-b from-black/55 to-transparent" />
          <div className="relative px-5 pt-30">
            <SlideText slide={carousel.active} variant="mobile" announce={carousel.isPaused} />
          </div>
        </>
      ) : (
        <SlideText slide={carousel.active} variant="desktop" announce={carousel.isPaused} />
      )}
      <CarouselControls
        prevHandler={carousel.prev}
        nextHandler={carousel.next}
        progress={carousel.progress}
        activeIndex={carousel.activeIndex}
        count={carousel.count}
        compact={compact}
      />
    </motion.div>
  );
};

export default HeroStage;
