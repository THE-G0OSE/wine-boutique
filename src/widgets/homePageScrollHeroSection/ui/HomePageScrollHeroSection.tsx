import { cardsMock, ScrollCardElement, StoryCard } from "@/entities/heroPageScrollCards";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { ScrollHeroSectionProgressBar } from "./components/progressBar";
import { useScrollHeroSection } from "../model";

/** Десктоп: экран прилипает, и пять историй сменяют друг друга по мере прокрутки */
const PinnedStories = () => {
  const { ref, activeIndex, isPinned, floatY, progress } = useScrollHeroSection(cardsMock.length, 40);

  return (
    <section ref={ref} aria-label="Истории" className="relative h-[600vh]">
      <div className="@container sticky top-0 h-svh overflow-hidden bg-cellar-800 bg-[url(/images/textures/wood.webp)] bg-size-[25%_auto] bg-repeat">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 inset-shadow-top-sm" />
        <ScrollHeroSectionProgressBar count={cardsMock.length} progress={progress} isOpen={isPinned} y={floatY} />
        {cardsMock.map((card, index) => (
          <ScrollCardElement key={card.image} card={card} isActive={index === activeIndex} floatY={floatY} />
        ))}
      </div>
    </section>
  );
};

/** Мобильные: истории лентой, каждая всплывает при появлении на экране */
const StoriesFeed = () => (
  <section aria-label="Истории" className="relative overflow-hidden bg-cellar-800 pt-10 pb-5">
    <img src="/images/textures/wood.webp" alt="" className="absolute inset-0 size-full object-cover" />
    <div aria-hidden="true" className="absolute inset-0 bg-cellar-950/25" />
    {cardsMock.map((card) => (
      <StoryCard key={card.image} card={card} />
    ))}
  </section>
);

const HomePageScrollHeroSection = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  return isDesktop ? <PinnedStories /> : <StoriesFeed />;
};

export default HomePageScrollHeroSection;
