import { formatReviewCity, formatReviewDate, type Review } from "@/entities/review";
import { stage, stageFont } from "@/shared/lib/stage";
import type { FC } from "react";
import { Newsprint } from "uikit;/";

/** Сгиб листа: тень и блик поперёк письма */
const fold = "absolute inset-x-0 h-3.5 bg-[linear-gradient(180deg,transparent_0%,rgba(90,70,40,0.12)_50%,rgba(255,255,255,0.4)_56%,transparent_100%)]";

/** Развёрнутое письмо гостя (десктоп): лист, сложенный втрое, рукописный текст по линейкам */
const LetterSheet: FC<{ review: Review }> = ({ review }) => (
  <div
    className="relative flex h-full flex-col overflow-hidden bg-letter text-letter-ink"
    style={{ padding: `${stage(44)} ${stage(56)} ${stage(40)}` }}
  >
    <Newsprint variant="letter" />
    <span aria-hidden="true" className={fold} style={{ top: "33.3%" }} />
    <span aria-hidden="true" className={fold} style={{ top: "66.6%" }} />

    <span className="relative self-end font-hand" style={{ fontSize: stageFont(24, 16) }}>
      {formatReviewCity(review.city)}, {formatReviewDate(review.receivedAt)}
    </span>
    <span className="relative font-script leading-[1.2]" style={{ marginTop: stage(10), fontSize: stageFont(38, 24) }}>
      {review.greeting}
    </span>
    <p
      className="relative m-0 font-hand"
      style={{
        marginTop: stage(14),
        fontSize: stageFont(28, 17),
        lineHeight: stage(40),
        // Линейки под каждой строкой — шаг равен интерлиньяжу
        backgroundImage: `repeating-linear-gradient(180deg, transparent 0, transparent calc(${stage(40)} - 1px), rgba(31,42,68,0.14) calc(${stage(40)} - 1px), rgba(31,42,68,0.14) ${stage(40)})`,
      }}
    >
      {review.text}
    </p>
    <div className="relative mt-auto flex items-end justify-between gap-6">
      <span className="font-hand opacity-85" style={{ fontSize: stageFont(24, 16) }}>
        {review.postscript}
      </span>
      <span className="font-script" style={{ fontSize: stageFont(36, 22) }}>
        {review.signature}
      </span>
    </div>
  </div>
);

export default LetterSheet;
