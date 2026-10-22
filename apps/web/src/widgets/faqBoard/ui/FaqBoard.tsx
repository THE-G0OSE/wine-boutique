import { useState, type FC } from "react";
import { Link, useSearchParams } from "react-router";
import { CONTACTS } from "@/shared/config/contacts";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { ButtonLink, Eyebrow, Text } from "uikit;/";
import { FAQ_NOTES, FAQ_TOPICS, NOTE_COLORS, PIN_COLORS, type FaqTopic } from "../model/mock";

const isTopic = (value: string): value is FaqTopic => FAQ_TOPICS.some((topic) => topic.id === value && value !== "all");

/** Наклон записки: детерминированный по номеру, как в макете */
const tilt = (index: number, factor: number) => (((index * 7) % 5) - 2) * factor;

/**
 * Вопросы и ответы (/faq, макеты Faq и MFaq): пробковая доска с записками, тема — в URL (`?topic=wine`).
 * Нажатая записка выпрямляется и показывает ответ со ссылкой.
 */
const FaqBoard: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const [params, setParams] = useSearchParams();
  const raw = params.get("topic") ?? "";
  const topic = isTopic(raw) ? raw : "all";
  const [open, setOpen] = useState<string | null>(FAQ_NOTES[0].id);

  const pickTopic = (id: FaqTopic | "all") =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === "all") next.delete("topic");
        else next.set("topic", id);
        return next;
      },
      { replace: true, preventScrollReset: true }
    );

  const notes = FAQ_NOTES.map((note, index) => ({ note, index })).filter(({ note }) => topic === "all" || note.topic === topic);

  const topics = (
    <div
      role="group"
      aria-label="Темы"
      className={cn("flex", { "shrink-0 gap-2.5": isDesktop, "mt-3.5 gap-2 overflow-x-auto overflow-y-hidden px-5 [scrollbar-width:none]": !isDesktop })}
    >
      {FAQ_TOPICS.map((item) => {
        const on = item.id === topic;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={on}
            onClick={() => pickTopic(item.id)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
              { "h-11 px-5 text-sm": isDesktop, "h-10 px-4 text-micro": !isDesktop },
              { "border-amber-350 bg-amber-350/20 text-amber-200": on, "border-cellar-700 bg-cellar-950/72 text-white hover:border-amber-350/60": !on }
            )}
          >
            {isDesktop ? item.title.desktop : item.title.mobile}
          </button>
        );
      })}
    </div>
  );

  const intro = (
    <section className={cn("flex", { "mx-auto max-w-480 items-end justify-between gap-15 px-10 2xl:px-30": isDesktop, "flex-col gap-2.5 px-5": !isDesktop })}>
      <div className={cn("flex flex-col", { "max-w-225 gap-3.5": isDesktop, "gap-2.5": !isDesktop })}>
        <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
          {isDesktop ? "Покупателям • FAQ" : "Покупателям · FAQ"}
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
          Вопросы и ответы
        </Text>
        <Text COLOR="MUTED" className={cn({ "text-[21px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
          {isDesktop
            ? "Всё, о чём нас чаще всего спрашивают, приколото к пробковой доске в бутике. Нажмите на записку, чтобы прочитать ответ."
            : "Записки с пробковой доски бутика. Нажмите, чтобы прочитать ответ."}
        </Text>
      </div>
      {isDesktop ? topics : null}
    </section>
  );

  const board = (
    <section
      aria-label="Доска вопросов"
      className={cn("bg-cork-frame shadow-[var(--shadow-panel),inset_0_0_0_4px_var(--color-cork-frame-inner)]", {
        "mx-auto mt-12 max-w-420 rounded-[10px] p-10 lg:mx-10 2xl:mx-auto": isDesktop,
        "mx-3 mt-4 rounded-lg p-3": !isDesktop,
      })}
    >
      <div
        className={cn(
          "rounded bg-[radial-gradient(circle_at_20%_30%,rgb(90_50_20/0.35)_0_2px,transparent_3px),radial-gradient(circle_at_70%_60%,rgb(60_30_10/0.3)_0_1.5px,transparent_2.5px),radial-gradient(circle_at_40%_80%,rgb(230_190_140/0.35)_0_2px,transparent_3px),linear-gradient(135deg,var(--color-cork),var(--color-cork-dark)_50%,var(--color-cork-mid))]",
          "bg-size-[23px_19px,17px_21px,29px_25px,auto] shadow-[inset_0_0_50px_rgb(50_25_8/0.55)]",
          { "grid min-h-150 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] items-start gap-x-8.5 gap-y-10 p-11": isDesktop, "flex flex-col gap-5.5 px-3.5 py-5.5": !isDesktop }
        )}
      >
        {notes.map(({ note, index }) => {
          const isOpen = note.id === open;
          return (
            <div
              key={note.id}
              className={cn("relative text-label-ink transition-[transform,box-shadow] duration-300 motion-reduce:transition-none", NOTE_COLORS[index % NOTE_COLORS.length], {
                "px-6 pt-7 pb-5.5": isDesktop,
                "px-4.5 pt-5 pb-4": !isDesktop,
                "z-2 shadow-panel": isOpen,
                "z-1 shadow-tag": !isOpen,
              })}
              style={{ transform: `rotate(${isOpen ? 0 : tilt(index, isDesktop ? 1.1 : 0.8)}deg) scale(${isOpen && isDesktop ? 1.04 : 1})` }}
            >
              <span
                aria-hidden="true"
                className={cn("absolute left-1/2 -translate-x-1/2 rounded-full shadow-tag", { "-top-2.5 size-5.5": isDesktop, "-top-2.25 size-4.5": !isDesktop })}
                style={{ background: `radial-gradient(circle at 35% 35%, ${PIN_COLORS[index % PIN_COLORS.length]}, rgb(0 0 0 / 0.5))` }}
              />
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : note.id)}
                className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left text-label-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
              >
                <span className={cn("font-hand font-bold", { "text-xl leading-[1.08]": isDesktop, "text-[25px] leading-[1.08]": !isDesktop })}>{note.question}</span>
                {isDesktop && !isOpen ? <span className="mt-2.5 block text-micro text-label-ink/60">ответ ↓</span> : null}
              </button>
              {isOpen ? (
                <div className={cn("border-t border-dashed border-label-ink/40", { "mt-3 pt-3": isDesktop, "mt-2 pt-2": !isDesktop })}>
                  <p className={cn("m-0", { "text-sm leading-normal": isDesktop, "text-[15px] leading-normal": !isDesktop })}>{note.answer}</p>
                  {note.link ? (
                    <Link to={note.link.to} className={cn("inline-block text-primary-500 hover:text-primary-350", { "mt-2.5 text-[15px]": isDesktop, "mt-1.5 text-micro": !isDesktop })}>
                      {note.link.label}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );

  const contact = isDesktop ? (
    <section className="mx-auto my-18 flex max-w-420 items-center justify-between gap-10 rounded-3xl border border-cellar-700 bg-cellar-950/80 px-12 py-10 lg:mx-10 2xl:mx-auto">
      <div className="flex flex-col gap-1.5">
        <Text as="span" FONT="FIRM" className="text-2xl leading-13">
          Не нашли свой вопрос?
        </Text>
        <Text COLOR="MUTED" className="text-caption">
          Сомелье отвечает по телефону {CONTACTS.phone} ежедневно с 12 до 22 — или напишите нам письмо.
        </Text>
      </div>
      <ButtonLink to={ROUTES.reviews} size="xl" className="shrink-0">
        Написать письмо
      </ButtonLink>
    </section>
  ) : (
    <Link to={ROUTES.reviews} className="mx-4 mt-6 mb-10 flex flex-col gap-1 rounded-[20px] border border-cellar-700 bg-cellar-950/82 p-5 text-white no-underline">
      <Text as="span" FONT="FIRM" className="text-[22px] leading-8">
        Не нашли вопрос?
      </Text>
      <span className="text-micro text-amber-200">Напишите нам письмо →</span>
    </Link>
  );

  return (
    <>
      {intro}
      {isDesktop ? null : topics}
      {board}
      {contact}
    </>
  );
};

export default FaqBoard;
