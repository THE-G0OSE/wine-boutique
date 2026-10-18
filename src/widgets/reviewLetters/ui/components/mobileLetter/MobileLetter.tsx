import { formatReviewCity, formatReviewDate, REVIEW_TOPIC_LABELS, type Review } from "@/entities/review";
import { cn } from "@/shared/lib/cn";
import { AnimatePresence, motion } from "motion/react";
import { useId, type FC } from "react";
import { letterSlide, letterSlideTransition } from "../../../model/animations";

interface IProps {
  review: Review;
  index: number;
  open: boolean;
  onToggle: () => void;
}

const caveat = "flex flex-col font-hand";
const label = "text-micro text-paper-ink";

/** Мобильное письмо: конверт-кнопка, по нажатию письмо выскальзывает из-под него (MReviews) */
const MobileLetter: FC<IProps> = ({ review, index, open, onToggle }) => {
  const letterId = useId();
  const topic = REVIEW_TOPIC_LABELS[review.topic];

  return (
    <article aria-label={`Письмо гостя: ${topic}`} className="relative mx-4 mt-8.5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={letterId}
        onClick={onToggle}
        className={cn(
          "relative z-2 block h-52.5 w-full cursor-pointer border-0 bg-envelope-light p-0 text-left text-note-ink",
          "shadow-[0_20px_30px_rgba(0,0,0,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200",
          index % 2 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]"
        )}
      >
        {/* Кайма авиапочты */}
        <span
          aria-hidden="true"
          className="absolute inset-0 border-8 border-transparent [border-image:repeating-linear-gradient(45deg,var(--color-primary-500)_0_12px,var(--color-envelope-light)_12px_20px,var(--color-airmail)_20px_32px,var(--color-envelope-light)_32px_40px)_8]"
        />
        <img
          src="/images/reviews/stamp.webp"
          alt=""
          className="absolute top-4.5 right-4.5 size-16 object-contain mix-blend-multiply"
        />
        <span aria-hidden="true" className="absolute top-7.5 right-17.5 size-17.5 rounded-full border-2 border-note-ink/40" />
        <span className={cn(caveat, "absolute top-6.5 left-6.5")}>
          <span className={label}>От кого:</span>
          <span className="text-[28px] leading-none">{review.author}</span>
          <span className="text-md leading-snug">
            {formatReviewCity(review.city)} · {formatReviewDate(review.receivedAt)}
          </span>
        </span>
        <span className={cn(caveat, "absolute bottom-6 left-6.5")}>
          <span className={label}>Кому:</span>
          <span className="text-[22px] leading-snug">Premium Wine Boutique</span>
        </span>
        {/* Штемпель темы — над строкой адреса: длинная тема («бронь и самовывоз») не наезжает на «Кому» */}
        <span className="absolute right-5 bottom-16 -rotate-8 border-2 border-primary-500/70 px-2.5 py-1 font-typewriter text-xs font-bold whitespace-nowrap text-primary-500/85 uppercase">
          {topic}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={letterId}
            variants={letterSlide}
            initial="hidden"
            animate="shown"
            exit="hidden"
            transition={letterSlideTransition}
            className={cn(
              "relative z-1 mx-2 -mt-4.5 bg-letter px-5.5 pt-10 pb-6 font-hand text-note-ink shadow-[0_20px_30px_rgba(0,0,0,0.5)]",
              "bg-[repeating-linear-gradient(180deg,transparent_0_31px,rgba(43,76,140,0.18)_31px_32px)]",
              index % 2 ? "-rotate-1" : "rotate-1"
            )}
          >
            <span className="block text-[26px] leading-snug">{review.greeting}</span>
            <p className="m-0 mt-1.5 text-[22px] leading-8">{review.text}</p>
            {review.postscript && <span className="mt-2 block text-md text-paper-ink">{review.postscript}</span>}
            <span className="mt-2.5 block text-right font-script text-[26px]">{review.signature}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

export default MobileLetter;
