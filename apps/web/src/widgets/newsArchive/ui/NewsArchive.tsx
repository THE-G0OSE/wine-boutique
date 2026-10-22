import { formatArchiveMonth, useGetNewsArchiveQuery } from "@/entities/newsIssue";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { useId } from "react";
import { Eyebrow, Text } from "uikit;/";
import { useArchiveFilters } from "../model/lib/hooks/useArchiveFilters";
import IssueCard from "./components/issueCard/IssueCard";
import MonthStacks from "./components/monthStacks/MonthStacks";
import MonthStrip from "./components/monthStrip/MonthStrip";
import RubricChips from "./components/rubricChips/RubricChips";

const statusText = "mt-5 px-5 text-[19px] text-neutral-350 lg:px-0";

/** Подшивка «Винного Вѣстника»: выпуски по месяцам — стопки газет и первые полосы номеров */
const NewsArchive = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const panelId = useId();
  const titleId = useId();
  const filters = useArchiveFilters();
  const rubric = filters.rubric;
  const { data: archive, isLoading, isFetching, isError } = useGetNewsArchiveQuery({ month: filters.month, rubric });

  // Вкладка переключается сразу, выпуски месяца подтягиваются следом
  const selectedMonth = archive?.months.some(({ id }) => id === filters.month) ? filters.month : archive?.month;
  const shownMonth = archive && formatArchiveMonth(archive.month);

  let issues;
  if (isError) {
    issues = (
      <p role="alert" className={statusText}>
        Подшивка не нашлась — обновите страницу.
      </p>
    );
  } else if (isLoading || !archive) {
    issues = (
      <p role="status" className={statusText}>
        Достаём подшивку…
      </p>
    );
  } else if (archive.issues.length === 0) {
    issues = (
      <p className={statusText}>
        {rubric ? "В этом месяце по выбранной рубрике выпусков нет." : "В этом месяце выпусков нет."}
      </p>
    );
  } else {
    issues = (
      <div className={cn("grid", isDesktop ? "mt-7.5 grid-cols-4 gap-9" : "mt-4 grid-cols-2 gap-x-5 gap-y-6 px-6")}>
        {archive.issues.map((issue, index) => (
          <IssueCard key={issue.id} issue={issue} index={index} variant={isDesktop ? "desktop" : "mobile"} />
        ))}
      </div>
    );
  }

  return (
    <div className="lg:mx-auto lg:max-w-480 lg:px-10 2xl:px-30">
      <header className={cn(isDesktop ? "flex items-end justify-between gap-15" : "px-5 pt-1.5")}>
        <div className={cn("flex flex-col", isDesktop ? "gap-3.5" : "gap-2.5")}>
          <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={isDesktop ? "text-[22px]" : undefined}>
            {isDesktop ? "«Винный Вестник» • Архив" : "«Винный Вестник» · архив"}
          </Eyebrow>
          <Text
            as="h1"
            FONT="FIRM"
            SIZE={isDesktop ? "FIRM" : "TITLE"}
            COLOR="WHITE"
            className={isDesktop ? "text-shadow-2xl" : "leading-15 text-shadow-[8px_10px_4px_rgba(0,0,0,0.4)]"}
          >
            Подшивка
          </Text>
          <Text COLOR="MUTED" className={isDesktop ? "max-w-190 text-[21px] leading-[1.55]" : "text-sm leading-[1.55]"}>
            Все выпуски нашей газеты, сложенные по месяцам. Выберите стопку — и листайте первые полосы.
          </Text>
        </div>
        {isDesktop && <RubricChips rubric={rubric} onChange={filters.setRubric} />}
      </header>

      {archive &&
        (isDesktop ? (
          <MonthStacks months={archive.months} selected={selectedMonth} panelId={panelId} onSelect={filters.setMonth} />
        ) : (
          <>
            <MonthStrip months={archive.months} selected={selectedMonth} panelId={panelId} onSelect={filters.setMonth} />
            <div className="mt-3">
              <RubricChips rubric={rubric} onChange={filters.setRubric} compact />
            </div>
          </>
        ))}

      <section
        id={panelId}
        role={archive ? "tabpanel" : undefined}
        aria-labelledby={shownMonth ? titleId : undefined}
        aria-busy={isFetching}
        className={cn(
          "transition-opacity duration-200",
          { "mt-16": isDesktop, "mt-7": !isDesktop, "opacity-60": isFetching && !isLoading }
        )}
      >
        {shownMonth && (
          <Text
            as="h2"
            id={titleId}
            FONT="FIRM"
            SIZE={isDesktop ? "DISPLAY_SM" : undefined}
            COLOR="WHITE"
            className={isDesktop ? undefined : "px-6 text-[32px] leading-11"}
          >
            {shownMonth.name} {shownMonth.year}
          </Text>
        )}
        {issues}
      </section>
    </div>
  );
};

export default NewsArchive;
