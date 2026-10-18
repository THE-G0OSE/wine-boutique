import { formatReviewCity, formatReviewDate, REVIEW_TOPIC_LABELS, type Review } from "@/entities/review";
import { cn } from "@/shared/lib/cn";
import { stage, stageFont } from "@/shared/lib/stage";
import type { FC } from "react";
import { Newsprint } from "uikit;/";
import { asset } from "@/shared/lib/asset";

const caption = "font-paper tracking-[0.2em] text-letter-label uppercase";
const ruled = "border-b border-letter-label/45";

/** Зубцы марки: прозрачные кружки по краю маской */
const perforation =
  "[mask-image:radial-gradient(circle_at_5px_5px,transparent_3.5px,#000_4px)] [mask-position:-5px_-5px] [mask-size:10px_10px]";

/** Конверт письма (десктоп): кайма авиапочты, «От кого / Кому», марка, штемпель и отметка «Получено» */
const Envelope: FC<{ review: Review }> = ({ review }) => {
  const date = formatReviewDate(review.receivedAt);
  const city = formatReviewCity(review.city);

  return (
    <div className="relative size-full">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-md bg-[repeating-linear-gradient(-45deg,var(--color-primary-500)_0_16px,var(--color-paper)_16px_30px,var(--color-amber-500)_30px_46px,var(--color-paper)_46px_60px)]"
      />
      <div className="absolute overflow-hidden bg-envelope text-letter-ink" style={{ inset: stage(12) }}>
        <Newsprint variant="letter" />

        <div className="absolute flex flex-col gap-0.5" style={{ left: stage(34), top: stage(30) }}>
          <span className={caption} style={{ fontSize: stageFont(13, 10) }}>
            От кого
          </span>
          <span className="font-script leading-[1.15]" style={{ fontSize: stageFont(34, 20) }}>
            {review.author}
          </span>
          <span className="font-hand" style={{ fontSize: stageFont(24, 15) }}>
            {city}
          </span>
        </div>

        {/* Марка бутика */}
        <div
          aria-hidden="true"
          className={cn("absolute box-border bg-stamp shadow-[0_2px_4px_rgba(0,0,0,0.2)]", perforation)}
          style={{ right: stage(30), top: stage(26), width: stage(112), height: stage(136), padding: stage(8) }}
        >
          <div className="flex h-full flex-col items-center justify-between border border-primary-500 bg-stamp-inner px-1 py-1.5">
            <img
              src={asset("/images/reviews/stamp.webp")}
              alt=""
              className="object-contain mix-blend-multiply"
              style={{ width: stage(70), height: stage(70) }}
            />
            <span className="font-firm whitespace-nowrap text-primary-500" style={{ fontSize: stageFont(12, 8) }}>
              Wine Boutique
            </span>
          </div>
        </div>

        {/* Почтовый штемпель */}
        <div
          aria-hidden="true"
          className="absolute flex -rotate-14 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-letter-ink/55 font-paper text-letter-ink/70 uppercase"
          style={{ right: stage(92), top: stage(74), width: stage(128), height: stage(128) }}
        >
          <span className="absolute rounded-full border border-letter-ink/45" style={{ inset: stage(7) }} />
          <span className="tracking-[0.18em]" style={{ fontSize: stageFont(12, 8) }}>
            Москва
          </span>
          <span className="font-bold tracking-[0.05em]" style={{ fontSize: stageFont(15, 10) }}>
            {date}
          </span>
          <span className="tracking-[0.16em]" style={{ fontSize: stageFont(10, 7) }}>
            почта
          </span>
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 150 60"
          className="absolute -rotate-14 text-letter-ink opacity-55"
          style={{ right: stage(214), top: stage(104), width: stage(150), height: stage(60) }}
        >
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M0 12 Q 18 4 37 12 T 75 12 T 112 12 T 150 12" />
            <path d="M0 30 Q 18 22 37 30 T 75 30 T 112 30 T 150 30" />
            <path d="M0 48 Q 18 40 37 48 T 75 48 T 112 48 T 150 48" />
          </g>
        </svg>

        <div className="absolute flex flex-col" style={{ left: stage(260), right: stage(34), bottom: stage(34) }}>
          <span className={caption} style={{ fontSize: stageFont(13, 10) }}>
            Кому
          </span>
          <span className={cn("font-script", ruled)} style={{ fontSize: stageFont(30, 18), lineHeight: stage(44) }}>
            Premium Wine Boutique
          </span>
          <span className={cn("font-hand", ruled)} style={{ fontSize: stageFont(24, 15), lineHeight: stage(40) }}>
            Москва, погреб бутика
          </span>
          <span className={cn("font-hand", ruled)} style={{ fontSize: stageFont(24, 15), lineHeight: stage(40) }}>
            Тема: {REVIEW_TOPIC_LABELS[review.topic]}
          </span>
        </div>

        <div
          className="absolute -rotate-6 border-2 border-primary-500/70 font-paper font-bold tracking-[0.16em] text-primary-500/75 uppercase"
          style={{ left: stage(34), bottom: stage(34), padding: `${stage(6)} ${stage(12)}`, fontSize: stageFont(14, 9) }}
        >
          Получено {date}
        </div>
      </div>
    </div>
  );
};

export default Envelope;
