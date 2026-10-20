import { PickupRoute } from "@/widgets/pickupRoute";
import { PageBackground } from "uikit;/";

const PickupPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Бронь и самовывоз · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Как забрать вино: бронируем бутылки на ваше имя и держим три дня, выдаём в бутике по паспорту, оплата на месте."
      />
      <PageBackground />
      <PickupRoute />
    </div>
  );
};

export default PickupPage;
