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

/** Десктопные вкладки месяцев — ряд стопок газет */
const MonthStacks: FC<IProps> = ({ months, selected, panelId, onSelect }) => (
  <section aria-label="Месяцы" className="mt-14">
    <div role="tablist" onKeyDown={onTablistKeyDown} className="grid grid-cols-6 items-end gap-6.5">
      {months.map((month) => (
        <MonthStack
          key={month.id}
          month={month}
          selected={month.id === selected}
          panelId={panelId}
          onSelect={() => onSelect(month.id)}
        />
      ))}
    </div>
  </section>
);

export default MonthStacks;
