import type { FC } from "react";
import { PhoneAuthCard } from "@/features/auth/byPhone";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Eyebrow, Text } from "uikit;/";

const PERKS = ["Бронь в один клик и история покупок", "Опись бутылок в вашей ячейке с фото", "Бонусы с каждой бутылки и ранний доступ к поставкам"];

/** Вход (/auth, макеты Auth и MAuth): «Ваш ключ от погреба» и карточка входа по телефону */
const AuthWelcome: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  return (
    <section
      className={cn({
        "mx-auto grid min-h-[calc(100svh-168px)] max-w-480 grid-cols-[minmax(0,1fr)_minmax(460px,600px)] items-center gap-20 px-10 pb-24 2xl:gap-30 2xl:pr-50 2xl:pl-30": isDesktop,
        "flex flex-col": !isDesktop,
      })}
    >
      <div className={cn("flex flex-col", { "max-w-180 gap-4.5": isDesktop, "gap-2 px-5": !isDesktop })}>
        <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
          Клуб гостей погреба
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
          Ваш ключ от погреба
        </Text>
        {isDesktop ? (
          <>
            <Text COLOR="MUTED" className="text-[21px] leading-[1.55]">
              Брони, ячейка, записи на дегустации и бонусы — в одном кабинете. Вход по номеру телефона, без паролей.
            </Text>
            <ul className="m-0 mt-2.5 flex list-none flex-col gap-3 p-0 text-caption">
              {PERKS.map((perk) => (
                <li key={perk}>
                  <span aria-hidden="true" className="text-amber-350">
                    ✦
                  </span>{" "}
                  {perk}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
      <div className={cn({ "mx-4 mt-5 mb-10": !isDesktop })}>
        <PhoneAuthCard variant={isDesktop ? "desktop" : "mobile"} />
      </div>
    </section>
  );
};

export default AuthWelcome;
