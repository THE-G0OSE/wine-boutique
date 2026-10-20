import { ShopShelves } from "@/widgets/shopShelves";
import { PageBackground } from "uikit;/";

const ShopPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Магазин — винные полки · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Полки винной лавки: красные, белые, игристые и сладкие вина и коллекция 10+ лет. Бронь бутылок и самовывоз из бутика."
      />
      <PageBackground />
      <ShopShelves />
    </div>
  );
};

export default ShopPage;
