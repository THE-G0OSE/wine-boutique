import { useParams } from "react-router";
import { isWineShelf, SHELF_SHORT_LABELS, useGetShelvesQuery } from "@/entities/wine";
import { ROUTES } from "@/shared/config/routes";
import { CatalogShelf } from "@/widgets/catalogShelf";
import { ButtonLink, PageBackground, Text } from "uikit;/";

const ShelfPage = () => {
  const { shelf } = useParams();
  const { data: shelves } = useGetShelvesQuery({ limit: 1 }, { skip: !isWineShelf(shelf) });

  if (!isWineShelf(shelf)) {
    return (
      <div className="relative isolate pt-22 lg:pt-42">
        <title>Полка не найдена · Premium Wine Boutique</title>
        <PageBackground />
        <div className="mx-5 flex flex-col items-start gap-5 pb-20 lg:mx-auto lg:max-w-480 lg:px-10 2xl:px-30">
          <Text as="h1" FONT="FIRM" className="text-title leading-15">
            Такой полки в лавке нет
          </Text>
          <ButtonLink to={ROUTES.shop}>Ко всем полкам</ButtonLink>
        </div>
      </div>
    );
  }

  const title = shelves?.find((item) => item.id === shelf)?.title ?? SHELF_SHORT_LABELS[shelf];

  return (
    // Крошки — сразу под шапкой (макет Category)
    <div className="relative isolate pt-20 lg:pt-31">
      <title>{`${title} — полка магазина · Premium Wine Boutique`}</title>
      <meta name="description" content={`${title}: вина на полке бутика, фильтры по стране, сорту, цене и выдержке. Бронь и самовывоз.`} />
      <PageBackground />
      <CatalogShelf shelf={shelf} />
    </div>
  );
};

export default ShelfPage;
