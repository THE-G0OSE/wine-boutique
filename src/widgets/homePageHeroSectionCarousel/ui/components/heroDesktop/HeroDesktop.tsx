import { HeroPageImage } from "@/entities/heroPageImages";
import { useElementSize } from "@/shared/lib/hooks/useElementSize";
import { AnimatePresence } from "motion/react";
import type { FC } from "react";
import { getHeroGeometry, HERO_LAYOUT, slideBox, slideEnterBox, slideExitBox } from "../../../model/layout";
import type { HeroCarousel } from "../../../model/types";
import CarouselControls from "../carouselControls/ui/CarouselControls";
import SlideText from "../slideText/SlideText";

interface IProps {
  carousel: HeroCarousel;
}

/**
 * Десктоп: активный слайд — фон на весь экран, следующие — ряд карточек справа.
 * Геометрия считается в пикселях секции, чтобы motion плавно анимировал смену слайдов.
 */
const HeroDesktop: FC<IProps> = ({ carousel }) => {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const geometry = getHeroGeometry(size.width, size.height);
  const visible = carousel.ordered.slice(0, HERO_LAYOUT.visibleSlides);

  return (
    <div ref={ref} className="@container absolute inset-0">
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
              scale={geometry.scale}
            />
          ))}
        </AnimatePresence>
      )}
      <SlideText slide={carousel.active} variant="desktop" announce={carousel.isPaused} />
      <CarouselControls
        prevHandler={carousel.prev}
        nextHandler={carousel.next}
        progress={carousel.progress}
        activeIndex={carousel.activeIndex}
        count={carousel.count}
      />
    </div>
  );
};

export default HeroDesktop;
