import { cardsMock, ScrollCardElement } from "@/entities/heroPageScrollCards";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { ScrollHeroSectionProgressBar } from "./components/progressBar";
import { useScrollHeroSection } from "../model";
import { asset } from "@/shared/lib/asset";

/**
 * Экран прилипает, и пять историй сменяют друг друга по мере прокрутки: бумага с бутылкой въезжает сбоку,
 * текст всплывает. На телефоне — та же сцена в портретной раскладке
 */
const PinnedStories = ({ compact }: { compact: boolean }) => {
  const { ref, activeIndex, isPinned, floatY, progress } = useScrollHeroSection(cardsMock.length, 40);

  return (
    <section ref={ref} aria-label="Истории" className="relative h-[600vh]">
      {/* Дерево — на всю ширину экрана, истории — по центру, не шире макета 1920 */}
      <div
        className="sticky top-0 h-svh overflow-hidden bg-cellar-800 bg-size-[min(25%,480px)_auto] bg-repeat"
        style={{ backgroundImage: `url(${asset("/images/textures/wood.webp")})` }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 inset-shadow-top-sm" />
        <div className="@container relative mx-auto h-full max-w-[1920px]">
          <ScrollHeroSectionProgressBar count={cardsMock.length} progress={progress} isOpen={isPinned} y={floatY} />
          {cardsMock.map((card, index) => (
            <ScrollCardElement key={card.image} card={card} isActive={index === activeIndex} floatY={floatY} compact={compact} />
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePageScrollHeroSection = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  return <PinnedStories compact={!isDesktop} />;
};

export default HomePageScrollHeroSection;
