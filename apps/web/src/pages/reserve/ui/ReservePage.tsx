import { ReserveCheckout } from "@/widgets/reserveCheckout";
import { PageBackground } from "uikit;/";

const ReservePage = () => {
  return (
    // Форма начинается сразу под шапкой (макет Reserve)
    <div className="relative isolate pt-20 lg:pt-36">
      <title>Бронирование · Premium Wine Boutique</title>
      <meta name="robots" content="noindex" />
      <PageBackground />
      <ReserveCheckout />
    </div>
  );
};

export default ReservePage;
