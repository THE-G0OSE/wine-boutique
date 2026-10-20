import type { FC } from "react";
import { LuCalendarPlus } from "react-icons/lu";
import { Link } from "react-router";
import { useGetReservationQuery } from "@/entities/reservation";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { downloadIcs } from "@/shared/lib/ics";
import { ButtonLink, Eyebrow, Text } from "uikit;/";
import Receipt from "./components/receipt/Receipt";

interface IProps {
  id: string;
}

const STEPS = ["Придите в бутик в выбранный день и время", "Назовите номер брони и покажите паспорт", "Оплатите на месте — картой или наличными"];

/** Квитанция о брони (/reserve/:id, макеты Success и MSuccess): «Бронь принята!», чек, шаги, «В календарь» */
const ReservationReceipt: FC<IProps> = ({ id }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { data: reservation, error, isLoading } = useGetReservationQuery(id);

  if (isLoading) return <div className="min-h-screen" aria-busy="true" />;

  if (!reservation) {
    const notFound = isApiError(error) && error.status === 404;
    return (
      <div className="mx-5 flex flex-col items-start gap-5 pb-20 lg:mx-auto lg:max-w-480 lg:px-10 2xl:px-30">
        <Text as="h1" FONT="FIRM" className="text-title leading-15">
          {notFound ? "Такой брони нет" : "Не удалось открыть квитанцию"}
        </Text>
        <Text COLOR="MUTED">{notFound ? "Проверьте ссылку из SMS — или оформите бронь заново." : "Обновите страницу или загляните позже."}</Text>
        <ButtonLink to={ROUTES.shop}>К полкам</ButtonLink>
      </div>
    );
  }

  const addToCalendar = () => {
    const start = new Date(reservation.pickupAt);
    downloadIcs(
      {
        uid: `${reservation.id}@premium-wine-boutique`,
        title: `Забрать бронь ${reservation.number}`,
        description: `${reservation.boutique.name}. Назовите номер брони и покажите паспорт.`,
        location: reservation.boutique.address,
        start,
        end: new Date(start.getTime() + 60 * 60_000),
      },
      `bron-${reservation.number.toLowerCase()}.ics`
    );
  };

  const calendarButton = (
    <button
      type="button"
      onClick={addToCalendar}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-amber-200/50 bg-cellar-950/60 font-regular font-semibold text-white",
        "hover:border-amber-200 focus-visible:outline-2 focus-visible:outline-amber-200",
        { "h-15 px-7.5 text-md": isDesktop, "h-13.5 w-full text-[17px]": !isDesktop }
      )}
    >
      <LuCalendarPlus size={20} aria-hidden="true" />В календарь
    </button>
  );

  if (!isDesktop) {
    return (
      <div className="pb-10">
        <section className="flex flex-col gap-2.5 px-5">
          <Eyebrow size="sm">Бронь № {reservation.number}</Eyebrow>
          <Text as="h1" FONT="FIRM" SIZE="TITLE" className="leading-15 text-shadow-lg">
            Бронь принята!
          </Text>
          <Text COLOR="MUTED" SIZE="SYSTEM" className="leading-[1.55]">
            Бутылки отложены на ваше имя, квитанция ушла в SMS. Покажите номер брони и паспорт в бутике.
          </Text>
        </section>
        <div className="mt-6.5">
          <Receipt reservation={reservation} variant="mobile" />
        </div>
        <div className="mx-5 mt-7 flex flex-col gap-3">
          <ButtonLink to={ROUTES.shop} size="lg" className="w-full">
            Вернуться в магазин
          </ButtonLink>
          {calendarButton}
          <Link to={ROUTES.home} className="self-center font-semibold text-amber-200 no-underline">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-168px)] max-w-480 grid-cols-[minmax(0,1fr)_minmax(480px,640px)] items-center gap-30 px-10 pb-30 2xl:pr-50 2xl:pl-30">
      <div className="flex max-w-180 flex-col gap-5.5">
        <Eyebrow labelClassName="text-[22px]">Бронь № {reservation.number}</Eyebrow>
        <Text as="h1" FONT="FIRM" className="text-[104px] leading-34 text-shadow-2xl">
          Бронь принята!
        </Text>
        <Text COLOR="MUTED" className="text-[22px] leading-[1.55]">
          Мы отложили бутылки на ваше имя и прислали квитанцию в SMS. Покажите номер брони и паспорт в бутике — сомелье вынесет заказ и,
          если хотите, откроет бутылку на пробу.
        </Text>
        <div className="mt-3.5 flex flex-wrap gap-4">
          <ButtonLink to={ROUTES.shop} size="xl">
            Вернуться в магазин
          </ButtonLink>
          {calendarButton}
          <Link to={ROUTES.home} className="flex h-15 items-center px-5 text-md font-semibold text-amber-200 no-underline hover:text-paper">
            На главную
          </Link>
        </div>
        <ol className="m-0 mt-6.5 grid list-none grid-cols-3 gap-4 p-0">
          {STEPS.map((step, index) => (
            <li key={step} className="flex flex-col gap-1.5 rounded-[18px] border border-cellar-700 bg-cellar-950/75 px-5.5 py-5">
              <span aria-hidden="true" className="font-firm text-[26px] text-amber-200">
                {index + 1}
              </span>
              <span className="text-sm leading-[1.45] text-neutral-350">{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <Receipt reservation={reservation} variant="desktop" />
    </div>
  );
};

export default ReservationReceipt;
