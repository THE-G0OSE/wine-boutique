import { CellarWall } from "@/widgets/cellarWall";
import { PageBackground } from "uikit;/";

const CellarPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Хранение в погребе · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Личная ячейка в погребе бутика: +12…14 °C круглый год, влажность 70 %, охрана и опись бутылок. Выберите ячейку и оставьте заявку."
      />
      <PageBackground variant="cellar" />
      <CellarWall />
    </div>
  );
};

export default CellarPage;
