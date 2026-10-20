import { NotFoundCellar } from "@/widgets/notFoundCellar";
import { PageBackground } from "uikit;/";

const NotFoundPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Страница не найдена · Premium Wine Boutique</title>
      <PageBackground variant="cellar" />
      <NotFoundCellar />
    </div>
  );
};

export default NotFoundPage;
