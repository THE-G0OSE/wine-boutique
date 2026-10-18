import { useGetReviewsInfiniteQuery } from "@/entities/review";
import { REVIEWS_ANCHORS } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { useState } from "react";
import { buttonClasses, Eyebrow, Text } from "uikit;/";
import LetterPair from "./components/letterPair/LetterPair";
import MobileLetter from "./components/mobileLetter/MobileLetter";
import WriteSection from "./components/writeSection/WriteSection";

const status = "mt-8 px-5 text-center text-caption text-neutral-350";

/** Письма гостей: на десктопе — письмо рядом с конвертом, на мобильных — конверты, которые открываются по нажатию */
const ReviewLetters = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetReviewsInfiniteQuery();
  const reviews = data?.pages.flatMap((page) => page.items) ?? [];
  // Мобильные: открыто одно письмо, первое — сразу
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const openLetter = openId === undefined ? reviews[0]?.id : openId;

  let letters;
  if (isLoading) {
    letters = (
      <p role="status" className={status}>
        Достаём письма из ящика…
      </p>
    );
  } else if (isError && reviews.length === 0) {
    letters = (
      <p role="alert" className={status}>
        Письма не достались — обновите страницу.
      </p>
    );
  } else if (isDesktop) {
    letters = (
      <div className="mt-10 flex flex-col gap-14">
        {reviews.map((review, index) => (
          <LetterPair key={review.id} review={review} index={index} />
        ))}
      </div>
    );
  } else {
    letters = reviews.map((review, index) => (
      <MobileLetter
        key={review.id}
        review={review}
        index={index}
        open={openLetter === review.id}
        onToggle={() => setOpenId(openLetter === review.id ? null : review.id)}
      />
    ));
  }

  return (
    <div className="@container">
      <header
        className={cn(
          isDesktop
            ? "mx-auto flex max-w-480 items-end justify-between gap-15 px-10 2xl:px-30"
            : "flex flex-col gap-2.5 px-5 pt-1.5"
        )}
      >
        <div className={cn("flex flex-col", isDesktop ? "max-w-225 gap-3.5" : "gap-2.5")}>
          <Eyebrow size={isDesktop ? "lg" : "sm"}>{isDesktop ? "Отзывы • Reviews" : "Письма гостей"}</Eyebrow>
          <Text
            as="h1"
            FONT="FIRM"
            SIZE={isDesktop ? "FIRM" : "TITLE"}
            COLOR="WHITE"
            className={isDesktop ? "text-shadow-2xl" : "leading-15 text-shadow-[8px_10px_4px_rgba(0,0,0,0.4)]"}
          >
            {isDesktop ? "Письма наших гостей" : "Нам пишут"}
          </Text>
          <Text COLOR="MUTED" SIZE={isDesktop ? "P" : "SYSTEM"} className={cn({ "leading-[1.55]": !isDesktop })}>
            {isDesktop
              ? "Мы храним каждое письмо так же бережно, как вино в погребе. Вот что пишут те, кто уже открыл свою бутылку."
              : "Нажмите на конверт — письмо выскользнет наружу."}
          </Text>
        </div>
        {isDesktop && (
          <a href={`#${REVIEWS_ANCHORS.write}`} className={buttonClasses({ size: "lg", className: "shrink-0 gap-3 px-7" })}>
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16v12H4z" />
              <path d="M4 7l8 6 8-6" />
            </svg>
            Написать письмо
          </a>
        )}
      </header>

      <div aria-busy={isFetchingNextPage}>{letters}</div>

      {hasNextPage && (
        <div className={cn("flex justify-center", isDesktop ? "mt-12" : "mt-8.5 px-5")}>
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className={cn(
              "cursor-pointer rounded-full border font-regular font-semibold transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 disabled:cursor-default",
              isDesktop
                ? "h-13 border-amber-200/45 bg-cellar-950/75 px-7.5 text-[17px] text-amber-200 hover:border-amber-200"
                : "h-13.5 w-full border-amber-200/50 bg-cellar-950/60 px-5.5 text-[17px] text-white"
            )}
          >
            {isFetchingNextPage ? "Достаём письма из ящика…" : "Показать ещё письма"}
          </button>
        </div>
      )}

      <WriteSection isDesktop={isDesktop} />
    </div>
  );
};

export default ReviewLetters;
