import { Fragment, type FC } from "react";
import { Link } from "react-router";
import { cn } from "@/shared/lib/cn";

export interface BreadcrumbItem {
  label: string;
  /** Без адреса — текущая страница */
  to?: string;
}

interface IProps {
  items: BreadcrumbItem[];
  /** lg — десктоп (17px), sm — мобильные (14px) */
  size?: "lg" | "sm";
  className?: string;
}

/** Хлебные крошки: «Магазин / Красные / Sassicaia 2015» */
const Breadcrumbs: FC<IProps> = ({ items, size = "lg", className }) => {
  return (
    <nav aria-label="Хлебные крошки" className={cn("text-neutral-350", { "text-[17px]": size === "lg", "text-micro": size === "sm" }, className)}>
      <ol className={cn("m-0 flex list-none flex-wrap items-center p-0", { "gap-3": size === "lg", "gap-2": size === "sm" })}>
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <li aria-hidden="true" className="contents">
                <span>/</span>
              </li>
            ) : null}
            <li className="contents">
              {item.to ? (
                <Link to={item.to} className="text-amber-200 no-underline hover:text-paper">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-white">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
