import type { FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Номера страниц вокруг текущей: 1 … 4 5 6 … 12 */
const visiblePages = (page: number, pages: number): (number | "gap")[] => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const around = [page - 1, page, page + 1].filter((n) => n > 1 && n < pages);
  const result: (number | "gap")[] = [1];
  if (around[0] > 2) result.push("gap");
  result.push(...around);
  if (around[around.length - 1] < pages - 1) result.push("gap");
  result.push(pages);
  return result;
};

const circle = "flex size-13 items-center justify-center rounded-full border font-system text-[17px] font-semibold transition-colors";

/** Страницы списка: ← 1 2 3 → (макет Category) */
const Pagination: FC<IProps> = ({ page, pages, onChange, className }) => {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Страницы" className={cn("flex items-center justify-center gap-2.5", className)}>
      <button
        type="button"
        aria-label="Предыдущая страница"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(circle, "cursor-pointer border-cellar-700 bg-cellar-950/80 text-md text-white hover:border-amber-350 disabled:cursor-default disabled:opacity-35")}
      >
        ←
      </button>
      {visiblePages(page, pages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-neutral-350">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            aria-label={`Страница ${item}`}
            onClick={() => onChange(item)}
            className={cn(circle, "cursor-pointer", {
              "border-amber-350 bg-amber-350 text-black": item === page,
              "border-cellar-700 bg-cellar-950/80 text-white hover:border-amber-350": item !== page,
            })}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        aria-label="Следующая страница"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className={cn(circle, "cursor-pointer border-cellar-700 bg-cellar-950/80 text-md text-white hover:border-amber-350 disabled:cursor-default disabled:opacity-35")}
      >
        →
      </button>
    </nav>
  );
};

export default Pagination;
