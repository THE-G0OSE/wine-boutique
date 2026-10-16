import type { SlideBox } from "@/entities/heroPageImages";
import { DESIGN_WIDTH } from "@/shared/lib/stage";

/** Координаты hero из макета 1920×1080 (артборд Hero). Вертикаль карточек и управления — от низа экрана */
export const HERO_LAYOUT = {
  /** фон + столько карточек справа (последняя уходит за край и въезжает при листании) */
  visibleSlides: 6,
  card: { left: 866, step: 275.67, width: 254, height: 343, bottom: 210, radius: 10 },
  text: { left: 56, top: 352, width: 620 },
  arrows: { left: 850, gap: 18, size: 100, bottom: 56 },
  progress: { left: 1098, width: 700, bottom: 105 },
  counter: { left: 1812, bottom: 106 },
} as const;

export interface HeroGeometry {
  width: number;
  height: number;
  /** ширина секции / 1920, не больше 1 */
  scale: number;
}

export const getHeroGeometry = (width: number, height: number): HeroGeometry => ({
  width,
  height,
  scale: Math.min(width, DESIGN_WIDTH) / DESIGN_WIDTH,
});

const backgroundBox = ({ width, height }: HeroGeometry): SlideBox => ({
  left: 0,
  top: 0,
  width,
  height,
  borderRadius: 0,
  scale: 1,
  opacity: 1,
});

const cardBox = (index: number, { height, scale }: HeroGeometry): SlideBox => {
  const { card } = HERO_LAYOUT;
  return {
    left: (card.left + (index - 1) * card.step) * scale,
    top: height - (card.bottom + card.height) * scale,
    width: card.width * scale,
    height: card.height * scale,
    borderRadius: card.radius,
    scale: 1,
    opacity: 1,
  };
};

/** Куда встать слайду с позицией `index` */
export const slideBox = (index: number, geometry: HeroGeometry) =>
  index === 0 ? backgroundBox(geometry) : cardBox(index, geometry);

/**
 * Откуда слайд появляется: новый фон (листание назад) — из увеличенного кадра,
 * новая карточка — со своего места за правым краем.
 */
export const slideEnterBox = (index: number, geometry: HeroGeometry): SlideBox =>
  index === 0 ? { ...backgroundBox(geometry), scale: 1.2 } : { ...cardBox(index, geometry), opacity: 0 };

/** Куда слайд уходит: старый фон увеличивается под новым, лишняя карточка гаснет */
export const slideExitBox = (index: number, geometry: HeroGeometry): SlideBox =>
  index === 0 ? { ...backgroundBox(geometry), scale: 1.2 } : { ...cardBox(index, geometry), opacity: 0 };
