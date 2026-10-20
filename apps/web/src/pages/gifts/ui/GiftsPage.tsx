import { GiftBuilder } from "@/widgets/giftBuilder";
import { PageBackground } from "uikit;/";

const GiftsPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Корпоративные подарки · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Соберите подарочный ящик для партнёров и команды: упаковка, вина, бокалы и бирка с гравировкой. От 10 подарков — с подбором сомелье и логотипом."
      />
      <PageBackground />
      <GiftBuilder />
    </div>
  );
};

export default GiftsPage;
