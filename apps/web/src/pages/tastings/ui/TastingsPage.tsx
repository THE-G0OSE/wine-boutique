import { TastingFormats } from "@/widgets/tastingFormats";
import { TastingsCalendar } from "@/widgets/tastingsCalendar";
import { PageBackground } from "uikit;/";

const TastingsPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Дегустации · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Календарь дегустаций в погребе: вертикали, слепые сравнения, гастроужины и мастер-классы. До 12 гостей за столом, запись онлайн."
      />
      <PageBackground variant="cellar" />
      <TastingsCalendar />
      <TastingFormats />
    </div>
  );
};

export default TastingsPage;
