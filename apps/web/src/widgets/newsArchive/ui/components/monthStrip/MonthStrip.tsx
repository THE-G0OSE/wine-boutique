import { formatArchiveMonth, type NewsArchiveMonth } from "@/entities/newsIssue";
import type { FC } from "react";
import { Chip } from "uikit;/";
import { onTablistKeyDown } from "../../../model/lib/onTablistKeyDown";

interface IProps {
  months: NewsArchiveMonth[];
  selected: string | undefined;
  panelId: string;
  onSelect: (month: string) => void;
}

/** Мобильные вкладки месяцев — лента карточек с прокруткой вбок */
const MonthStrip: FC<IProps> = ({ months, selected, panelId, onSelect }) => (
  <div
    role="tablist"
    aria-label="Месяцы"
    onKeyDown={onTablistKeyDown}
    className="mt-4 flex gap-2.5 overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none]"
  >
    {months.map((month) => {
      const isSelected = month.id === selected;
      return (
        <Chip
          key={month.id}
          role="tab"
          aria-selected={isSelected}
          aria-controls={panelId}
          tabIndex={isSelected ? 0 : -1}
          variant="soft"
          active={isSelected}
          onClick={() => onSelect(month.id)}
          className="flex h-15 min-w-24 flex-none flex-col items-center justify-center rounded-[14px] px-3 text-[15px] leading-tight"
        >
          <span className="font-semibold">{formatArchiveMonth(month.id).name}</span>
          <span className="text-xs opacity-80">{month.issuesCount} вып.</span>
        </Chip>
      );
    })}
  </div>
);

export default MonthStrip;
