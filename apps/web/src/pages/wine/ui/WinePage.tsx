import { useParams } from "react-router";
import { useGetWineQuery } from "@/entities/wine";
import { WineCard } from "@/widgets/wineCard";
import { PageBackground } from "uikit;/";

const WinePage = () => {
  const { slug = "" } = useParams();
  const { data: wine } = useGetWineQuery(slug, { skip: !slug });

  return (
    <div className="relative isolate pt-18 lg:pt-31">
      <title>{wine ? `${wine.name} — карточка вина · Premium Wine Boutique` : "Карточка вина · Premium Wine Boutique"}</title>
      {wine ? <meta name="description" content={`${wine.name}: ${[wine.region, wine.country].filter(Boolean).join(", ")} · ${wine.grapes.join(", ")}. Бронь и самовывоз из бутика.`} /> : null}
      <PageBackground />
      <WineCard key={slug} slug={slug} />
    </div>
  );
};

export default WinePage;
