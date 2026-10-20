import { HallPlan } from "@/widgets/hallPlan";
import { PageBackground } from "uikit;/";

const HallPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Аренда зала · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Зал под сводами погреба для вашей компании: банкет до 14 гостей, фуршет до 30, лекция до 24. Сомелье, бокалы и подбор вин под повод."
      />
      <PageBackground variant="cellar" />
      <HallPlan />
    </div>
  );
};

export default HallPage;
