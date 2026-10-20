import type { FC } from "react";
import { LuSearch } from "react-icons/lu";
import { Link } from "react-router";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";

interface IProps {
  className?: string;
}

/** На мобильных полках поиск — ссылка в виде поля: ведёт на страницу поиска, где поле настоящее (MShop → MSearch) */
const SearchLink: FC<IProps> = ({ className }) => {
  return (
    <Link
      to={ROUTES.search}
      className={cn(
        "flex h-12.5 items-center gap-3 rounded-full border border-cellar-700 bg-cellar-950/80 px-4.5 font-system text-[15px] text-cellar-400 no-underline",
        className
      )}
    >
      <LuSearch size={18} aria-hidden="true" className="text-neutral-350" />
      Сорт, регион или винодельня
    </Link>
  );
};

export default SearchLink;
