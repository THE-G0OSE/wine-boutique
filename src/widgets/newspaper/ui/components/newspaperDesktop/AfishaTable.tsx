import { formatAfishaDate, formatAfishaSeats, type NewsAfishaItem } from "@/entities/newsIssue";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";

const th = "border-y border-ink px-2.5 py-2 font-normal";

/** «Афиша погреба» — таблица ближайших событий */
const AfishaTable: FC<{ items: NewsAfishaItem[] }> = ({ items }) => (
  <section className="mt-8 border-t-4 border-double border-ink pt-3.5">
    <h3 className="m-0 mb-2.5 text-center font-paper-display text-[36px] font-normal">Афиша погреба</h3>
    <table className="w-full border-collapse text-caption">
      <thead>
        <tr className="text-left text-[13px] tracking-[0.18em] uppercase">
          <th className={th}>Дата</th>
          <th className={th}>Событие</th>
          <th className={th}>Формат</th>
          <th className={cn(th, "text-right")}>Места</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const cell = cn("p-2.5 border-b border-ink", index < items.length - 1 && "border-dotted");
          return (
            <tr key={item.title}>
              <td className={cell}>{formatAfishaDate(item.startsAt)}</td>
              <td className={cn(cell, "font-bold")}>{item.title}</td>
              <td className={cn(cell, "italic")}>{item.format}</td>
              <td className={cn(cell, "text-right")}>{formatAfishaSeats(item)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </section>
);

export default AfishaTable;
