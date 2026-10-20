import { MonthlyCrateShowcase } from "@/widgets/monthlyCrate";
import { PageBackground } from "uikit;/";

const MonthlyPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Набор месяца · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Каждый месяц сомелье собирает ящик из вин на одну тему и откладывает его на ваше имя в бутике. Два, три или шесть вин, оплата при получении."
      />
      <PageBackground />
      <MonthlyCrateShowcase />
    </div>
  );
};

export default MonthlyPage;
