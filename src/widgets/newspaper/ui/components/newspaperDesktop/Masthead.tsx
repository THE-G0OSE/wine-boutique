import { formatIssueDateLong, formatIssueNumber, type NewsIssue } from "@/entities/newsIssue";
import type { FC } from "react";

const sideBox = "hidden border border-ink px-3.5 py-3 text-center text-[13px] leading-[1.5] tracking-[0.08em] whitespace-pre-line uppercase xl:block";

/** Шапка газеты: название, выходные данные и строка с датой */
const Masthead: FC<{ issue: NewsIssue }> = ({ issue }) => {
  const number = formatIssueNumber(issue.number);

  return (
    <header>
      <div className="grid items-center gap-7 xl:grid-cols-[230px_minmax(0,1fr)_230px]">
        <div className={sideBox}>{`Выпуск № ${number}\nЦена: бесплатно\nдля друзей бутика`}</div>
        <div className="text-center">
          {/* В макете 124px, но в колонку между плашками (764px) столько не помещается в строку — уменьшено до 100px */}
          <h1 className="m-0 font-paper-display text-[clamp(56px,5.2vw,100px)] leading-none font-normal tracking-[0.01em]">
            Винный Вѣстникъ
          </h1>
          <p className="m-0 mt-2.5 text-micro tracking-[0.32em] uppercase">Еженедельная газета бутика Premium Wine Boutique</p>
        </div>
        <div className={sideBox}>{issue.weather}</div>
      </div>

      <div className="mt-5.5 flex flex-wrap justify-between gap-x-6 border-t-4 border-b border-double border-ink py-2 text-micro tracking-[0.12em] uppercase">
        <span>№ {number} · Год первый</span>
        <time dateTime={issue.publishedAt}>{formatIssueDateLong(issue.publishedAt)}</time>
        <span>{issue.city}</span>
        <span>Тираж: для своих</span>
      </div>
    </header>
  );
};

export default Masthead;
