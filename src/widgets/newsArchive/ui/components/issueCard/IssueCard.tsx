import { formatArchiveDate, formatIssueNumber, NEWS_RUBRIC_LABELS, type NewsArchiveIssue } from "@/entities/newsIssue";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { Link } from "react-router";
import { Newsprint } from "uikit;/";

interface IProps {
  issue: NewsArchiveIssue;
  index: number;
  variant: "desktop" | "mobile";
}

const sizes = {
  desktop: {
    card: "h-130 shadow-[0_24px_40px_rgba(0,0,0,0.55)] hover:-translate-y-2.5",
    inner: "px-5 py-5.5",
    top: "text-[10px] tracking-[0.1em]",
    // Шрифты ужимаются вместе с карточкой (34px и 26px — при ширине 393px, 19px — при 167px)
    nameplate: "mt-1.5 text-[min(34px,8.65cqw)] leading-none",
    rule: "mt-2 h-1.5 border-t-[3px] border-b",
    title: "mt-1 text-[min(26px,6.6cqw)] leading-[1.04]",
    image: "mt-2.5 h-37.5",
    lines: "mt-2.5 bg-[repeating-linear-gradient(180deg,rgba(20,16,12,0.55)_0_2px,transparent_2px_7px)]",
  },
  mobile: {
    card: "h-65 shadow-[0_14px_24px_rgba(0,0,0,0.55)]",
    inner: "px-2.5 py-3",
    top: "text-[8px]",
    nameplate: "mt-1 text-[min(19px,11.3cqw)] leading-none",
    rule: "mt-1 border-t-[3px]",
    title: "mt-1.5 text-sm leading-[1.05]",
    image: "mt-1.5 h-17.5",
    lines: "mt-1.5 bg-[repeating-linear-gradient(180deg,rgba(20,16,12,0.5)_0_1.5px,transparent_1.5px_5px)]",
  },
};

/** Первая полоса выпуска в подшивке; ведёт на главную статью номера */
const IssueCard: FC<IProps> = ({ issue, index, variant }) => {
  const s = sizes[variant];
  const isDesktop = variant === "desktop";
  const number = formatIssueNumber(issue.number);
  const date = formatArchiveDate(issue.publishedAt, isDesktop);

  return (
    <Link
      to={ROUTES.article(issue.articleSlug)}
      aria-label={`Выпуск № ${number}, ${formatArchiveDate(issue.publishedAt)}: ${issue.title}`}
      className={cn(
        "relative block @container overflow-hidden text-ink no-underline transition-[translate] duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200",
        s.card
      )}
      style={{ rotate: `${index % 2 ? 1.2 : -1.2}deg` }}
    >
      <Newsprint overlayClassName={isDesktop ? "shadow-[inset_0_0_50px_rgba(120,85,35,0.25)]" : "hidden"} />
      <span className={cn("relative flex h-full flex-col font-paper", s.inner)}>
        <span className={cn("flex justify-between uppercase", s.top)}>
          <span>№ {number}</span>
          <span>{date}</span>
        </span>
        <span className={cn("text-center font-paper-display whitespace-nowrap", s.nameplate)}>Винный Вѣстникъ</span>
        <span aria-hidden="true" className={cn("block border-double border-ink", s.rule)} />
        {isDesktop && (
          <span className="mt-2.5 text-[10px] tracking-[0.2em] uppercase">{NEWS_RUBRIC_LABELS[issue.rubric]}</span>
        )}
        <span className={cn("font-paper-display", s.title)}>{issue.title}</span>
        <img src={issue.image} alt="" loading="lazy" className={cn("w-full border border-ink object-cover mix-blend-multiply", s.image)} />
        <span
          aria-hidden="true"
          className={cn(
            "flex-1",
            s.lines,
            { "[mask:linear-gradient(90deg,#000_48%,transparent_48%,transparent_52%,#000_52%)]": isDesktop }
          )}
        />
      </span>
    </Link>
  );
};

export default IssueCard;
