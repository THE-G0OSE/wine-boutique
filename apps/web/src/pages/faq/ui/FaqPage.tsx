import { FaqBoard } from "@/widgets/faqBoard";
import { PageBackground } from "uikit;/";

const FaqPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Вопросы и ответы · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Почему мы не доставляем вино, сколько держится бронь, как оплатить и записаться на дегустацию — ответы с пробковой доски бутика."
      />
      <PageBackground />
      <FaqBoard />
    </div>
  );
};

export default FaqPage;
