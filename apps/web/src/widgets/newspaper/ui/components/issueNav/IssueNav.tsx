import type { NewsIssue } from "@/entities/newsIssue";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { Link } from "react-router";

interface IProps {
  issue: NewsIssue;
  variant: "desktop" | "mobile";
}

const link = "text-ink no-underline hover:text-primary-500";

/** Переход по выпускам. Отдельных страниц выпусков нет — прошлые номера лежат в подшивке (архиве) */
const IssueNav: FC<IProps> = ({ issue, variant }) => {
  const isDesktop = variant === "desktop";
  const next = isDesktop ? "Следующий выпуск →" : "Следующий →";

  return (
    <nav
      aria-label="Выпуски"
      className={cn(
        "flex items-center justify-between border-t border-b-4 border-double border-ink uppercase",
        isDesktop ? "mt-5.5 py-2.5 text-[15px] tracking-[0.12em]" : "mt-3.5 py-2 text-xs tracking-[0.1em]"
      )}
    >
      {issue.previousIssueId ? (
        <Link to={ROUTES.newsArchive} className={link}>
          {isDesktop ? "← Предыдущий выпуск" : "← Прошлый"}
        </Link>
      ) : (
        <span />
      )}
      {isDesktop && <span>Стр. 1</span>}
      <Link to={ROUTES.newsArchive} className={link}>
        {isDesktop ? "Архив выпусков" : "Архив"}
      </Link>
      {issue.nextIssueId ? (
        <Link to={ROUTES.newsArchive} className={link}>
          {next}
        </Link>
      ) : (
        <span aria-disabled="true" className="opacity-40">
          {next}
        </span>
      )}
    </nav>
  );
};

export default IssueNav;
