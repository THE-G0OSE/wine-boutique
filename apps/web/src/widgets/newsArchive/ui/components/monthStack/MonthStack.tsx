import { formatArchiveMonth, type NewsArchiveMonth } from "@/entities/newsIssue";
import type { FC } from "react";
import { stackHeight, stackSheets, TWINE } from "../../../model/decor";

interface IProps {
  month: NewsArchiveMonth;
  selected: boolean;
  panelId: string;
  onSelect: () => void;
}

/** Вкладка месяца: стопка газет на бечёвке, выбранная приподнята */
const MonthStack: FC<IProps> = ({ month, selected, panelId, onSelect }) => {
  const { name } = formatArchiveMonth(month.id);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      className="flex cursor-pointer flex-col gap-3.5 border-0 bg-transparent p-0 font-regular text-white transition-[translate,opacity] duration-300 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-amber-200"
      style={{ translate: selected ? "0 -14px" : "0 0", opacity: selected ? 1 : 0.75 }}
    >
      <span aria-hidden="true" className="relative block w-full" style={{ height: stackHeight(month.issuesCount) }}>
        {stackSheets(month.issuesCount).map((style, index) => (
          <span key={index} className="absolute rounded-xs shadow-[0_2px_3px_rgba(0,0,0,0.35)]" style={style} />
        ))}
        <span
          className="absolute -top-1.5 -bottom-1.5 left-1/2 -ml-0.5 w-1 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
          style={{ background: TWINE }}
        />
        <span
          className="absolute top-1/2 -right-1.5 -left-1.5 -mt-0.5 h-1 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
          style={{ background: TWINE }}
        />
      </span>
      <span className="flex w-full justify-between text-caption">
        <span className="font-semibold">{name}</span>
        <span className="text-neutral-350">{month.issuesCount} вып.</span>
      </span>
    </button>
  );
};

export default MonthStack;
