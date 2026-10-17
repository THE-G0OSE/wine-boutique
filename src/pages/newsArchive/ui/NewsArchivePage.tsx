import { NewsArchive } from "@/widgets/newsArchive";
import { PageBackground } from "uikit;/";

const NewsArchivePage = () => {
  return (
    <div className="relative isolate pt-22 pb-10 lg:pt-42 lg:pb-24">
      <title>Подшивка выпусков — «Винный Вѣстникъ» · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Все выпуски газеты винного бутика по месяцам: поставки, урожай, дегустации и события погреба."
      />
      <PageBackground />
      <NewsArchive />
    </div>
  );
};

export default NewsArchivePage;
