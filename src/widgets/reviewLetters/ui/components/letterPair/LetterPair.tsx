import { REVIEW_TOPIC_LABELS, type Review } from "@/entities/review";
import { cn } from "@/shared/lib/cn";
import { stage } from "@/shared/lib/stage";
import type { CSSProperties, FC } from "react";
import Envelope from "../envelope/Envelope";
import LetterSheet from "../letterSheet/LetterSheet";

interface IProps {
  review: Review;
  index: number;
}

const paper = "relative shadow-[0_30px_50px_rgba(0,0,0,0.55),0_4px_10px_rgba(0,0,0,0.35)]";
const slide = "transition-[translate,rotate] duration-450 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none";

/** Письмо рядом со своим конвертом; при наведении они расходятся, а письмо выпрямляется */
const LetterPair: FC<IProps> = ({ review, index }) => {
  // Пары чередуют наклон, как в макете
  const tilt = {
    "--letter-tilt": `${index % 2 ? 1.2 : -1.4}deg`,
    "--envelope-tilt": `${index % 2 ? -2.2 : 2.6}deg`,
    "--letter-shift": stage(-24),
    "--envelope-shift": stage(20),
  } as CSSProperties;

  return (
    <article
      aria-label={`Письмо гостя, тема: ${REVIEW_TOPIC_LABELS[review.topic]}`}
      className="group flex items-center justify-center"
      style={{ ...tilt, height: stage(560) }}
    >
      <div
        className={cn(
          paper,
          slide,
          "z-2 rotate-(--letter-tilt) group-hover:translate-x-(--letter-shift) group-hover:rotate-0"
        )}
        style={{ width: stage(820), height: stage(520) }}
      >
        <LetterSheet review={review} />
      </div>
      <div
        className={cn(paper, slide, "z-1 rotate-(--envelope-tilt) group-hover:translate-x-(--envelope-shift)")}
        style={{ width: stage(700), height: stage(420), marginLeft: stage(-40), marginTop: stage(60) }}
      >
        <Envelope review={review} />
      </div>
    </article>
  );
};

export default LetterPair;
