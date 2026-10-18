import { WriteLetterForm } from "@/features/reviews/writeLetter";
import { REVIEWS_ANCHORS } from "@/shared/config/routes";
import type { FC } from "react";
import { Text } from "uikit;/";

/** «Напишите нам письмо»: лист-форма, на десктопе — с пояснением справа */
const WriteSection: FC<{ isDesktop: boolean }> = ({ isDesktop }) =>
  isDesktop ? (
    <section
      id={REVIEWS_ANCHORS.write}
      aria-label="Написать письмо"
      className="mx-auto mt-20 grid max-w-295 scroll-mt-32 grid-cols-[minmax(0,1fr)_360px] items-center gap-12 px-10"
    >
      <WriteLetterForm variant="desktop" />
      <div className="flex flex-col gap-3.5">
        <Text as="h2" FONT="FIRM" COLOR="WHITE" className="text-[36px] leading-[1.3]">
          Каждое письмо читает сомелье
        </Text>
        <Text COLOR="MUTED" SIZE="CAPTION" className="leading-[1.55]">
          Лучшие письма мы публикуем на этой странице — с разрешения автора. А на вопросы о вине отвечаем лично.
        </Text>
      </div>
    </section>
  ) : (
    <section id={REVIEWS_ANCHORS.write} aria-label="Написать письмо" className="mx-4 mt-8.5 scroll-mt-20">
      <WriteLetterForm variant="mobile" />
    </section>
  );

export default WriteSection;
