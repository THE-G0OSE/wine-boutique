import type { NewsArchiveMonth } from "@/entities/newsIssue";
import type { FC } from "react";
import { onTablistKeyDown } from "../../../model/lib/onTablistKeyDown";
import MonthStack from "../monthStack/MonthStack";

interface IProps {
  months: NewsArchiveMonth[];
  selected: string | undefined;
  panelId: string;
  onSelect: (month: string) => void;
}

/** Вкладки месяцев на телефоне: те же стопки газет на бечёвке, что на десктопе, — рядом с прокруткой вбок */
const MonthStrip: FC<IProps> = ({ months, selected, panelId, onSelect }) => (
  <div
    role="tablist"
    aria-label="Месяцы"
    onKeyDown={onTablistKeyDown}
    className="mt-5 flex items-end gap-6 overflow-x-auto overflow-y-hidden px-6 pt-5 pb-3 [scrollbar-width:none]"
  >
    {months.map((month) => (
      <MonthStack
        key={month.id}
        month={month}
        selected={month.id === selected}
        panelId={panelId}
        onSelect={() => onSelect(month.id)}
        compact
      />
    ))}
  </div>
);

export default MonthStrip;
