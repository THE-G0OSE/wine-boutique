import { Newspaper } from "@/widgets/newspaper";
import { PageBackground } from "uikit;/";

const NewsPage = () => {
  return (
    <div className="relative isolate pt-22 pb-10 lg:px-10 lg:pt-42 lg:pb-24">
      <title>Новости — «Винный Вѣстникъ» · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Еженедельная газета винного бутика: новые поставки, урожай на наших плантациях, дегустации и афиша погреба."
      />
      <PageBackground />
      <Newspaper />
    </div>
  );
};

export default NewsPage;
