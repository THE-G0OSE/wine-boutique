import { imageMock } from "@/entities/heroPageImages";
import { setWineMode } from "@/entities/wineMode";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { useReducedMotion } from "motion/react";
import { useEffect, type FocusEvent, type PointerEvent } from "react";
import { useCarousel } from "../model/lib/hooks/useCarousel";
import HeroDesktop from "./components/heroDesktop/HeroDesktop";
import HeroMobile from "./components/heroMobile/HeroMobile";

const HomePageHeroSectionCarousel = () => {
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const reducedMotion = useReducedMotion();
  const carousel = useCarousel({ items: imageMock, interval: 5000, cooldown: 900, autoplay: !reducedMotion });
  const { active, setIsPaused } = carousel;

  // Акцент страницы (полоса прогресса, черта над заголовком) — по виду вина на слайде
  useEffect(() => {
    dispatch(setWineMode(active.theme));
  }, [active, dispatch]);

  // Автопрокрутка замирает, пока посетитель смотрит на карусель мышью или клавиатурой
  const pauseOnMouse = (paused: boolean) => (event: PointerEvent) => {
    if (event.pointerType === "mouse") setIsPaused(paused);
  };
  const resumeOnBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
  };

  return (
    <section
      aria-roledescription="карусель"
      aria-label="Premium Wine Boutique"
      onPointerEnter={pauseOnMouse(true)}
      onPointerLeave={pauseOnMouse(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={resumeOnBlur}
      className="relative h-200 w-full overflow-hidden bg-cellar-950 lg:h-svh lg:min-h-160"
    >
      {isDesktop ? <HeroDesktop carousel={carousel} /> : <HeroMobile carousel={carousel} items={imageMock} />}
    </section>
  );
};

export default HomePageHeroSectionCarousel;
