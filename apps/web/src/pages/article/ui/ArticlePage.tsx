import { useGetNewsArticleQuery } from "@/entities/newsArticle";
import { NewsArticle } from "@/widgets/newsArticle";
import { useParams } from "react-router";
import { PageBackground } from "uikit;/";

const ArticlePage = () => {
  const { slug = "" } = useParams();
  // Тот же запрос, что и в виджете, — RTK Query отдаёт его из кэша, второго похода в API нет
  const { data: article, isError } = useGetNewsArticleQuery(slug);
  const heading = article?.title ?? (isError ? "Вырезка не найдена" : "Статья");

  return (
    <div className="relative isolate pt-16 pb-10 lg:pt-24 lg:pb-24">
      <title>{`${heading} — «Винный Вѣстникъ» · Premium Wine Boutique`}</title>
      {article && <meta name="description" content={article.standfirst ?? article.kicker} />}
      <PageBackground />
      <NewsArticle slug={slug} />
    </div>
  );
};

export default ArticlePage;
