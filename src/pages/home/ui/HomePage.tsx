import { useEffect } from "react";
import { useLocation } from "react-router";
import { HomePageCellarSection } from "@/widgets/homePageCellarSection";
import { HomePageHeroSectionCarousel } from "@/widgets/homePageHeroSectionCarousel";
import { HomePageScrollHeroSection } from "@/widgets/homePageScrollHeroSection";
import { HomePageVineyardsSection } from "@/widgets/homePageVineyardsSection";

const HomePage = () => {
  const { hash } = useLocation();

  // Ссылки вида «/#vineyards» из футера: роутер сам к якорю не прокручивает
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
      <title>Premium Wine Boutique — редкие вина из частных коллекций</title>
      <meta
        name="description"
        content="Винный бутик: редкие вина из частных коллекций, собственные виноградники и погреба. Бронь бутылок и самовывоз в Москве."
      />
      <HomePageHeroSectionCarousel />
      <HomePageScrollHeroSection />
      <HomePageVineyardsSection />
      <HomePageCellarSection />
    </>
  );
};

export default HomePage;
