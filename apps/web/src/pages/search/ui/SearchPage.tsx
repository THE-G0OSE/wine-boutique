import { useSearchParams } from "react-router";
import { SearchResults } from "@/widgets/searchResults";
import { PageBackground } from "uikit;/";

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q")?.trim();

  return (
    <div className="relative isolate pt-20 lg:pt-38">
      <title>{q ? `«${q}» — поиск по магазину · Premium Wine Boutique` : "Поиск по магазину · Premium Wine Boutique"}</title>
      <meta name="robots" content="noindex" />
      <PageBackground />
      <SearchResults />
    </div>
  );
};

export default SearchPage;
