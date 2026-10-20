import type { FC } from "react";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Text } from "uikit;/";
import { PRIVACY_OPERATOR, PRIVACY_REVISION, PRIVACY_SECTIONS } from "../model/mock";

/**
 * Политика конфиденциальности (/privacy, макеты Privacy и MPrivacy): документ на состаренной бумаге с полями и печатью.
 * На десктопе — липкое оглавление-якоря слева, на мобильных — пункты-аккордеоны (первый раскрыт).
 */
const PrivacyDocument: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);

  const seal = (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 -rotate-12 items-center justify-center rounded-[47%_53%_50%_48%] font-firm text-white/55 shadow-tag",
        "bg-[radial-gradient(circle_at_38%_34%,var(--color-primary-200),var(--color-primary-500)_55%,var(--color-primary-800))]",
        { "size-32.5 text-[48px]": isDesktop, "size-20 text-[30px]": !isDesktop }
      )}
    >
      W
    </span>
  );

  const operator = (
    <div className={cn("flex items-end justify-between", { "mt-14": isDesktop, "mt-5 gap-2.5": !isDesktop })}>
      <div className={cn("flex flex-col", { "gap-1.5 text-caption": isDesktop, "text-[13px] leading-normal": !isDesktop })}>
        {(isDesktop ? PRIVACY_OPERATOR.desktop : PRIVACY_OPERATOR.mobile).map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      {seal}
    </div>
  );

  const paper = (
    <>
      <img src={asset("/images/textures/newspaper.webp")} alt="" className="absolute inset-0 size-full object-cover opacity-55 mix-blend-multiply" />
      <div aria-hidden="true" className={cn("absolute inset-0", { "shadow-[inset_0_0_160px_rgb(120_80_30/0.35)]": isDesktop, "shadow-[inset_0_0_80px_rgb(120_80_30/0.35)]": !isDesktop })} />
    </>
  );

  if (!isDesktop) {
    return (
      <article className="relative mx-2.5 mb-10 bg-document px-4.5 pt-6.5 pb-7.5 font-paper text-label-ink shadow-panel">
        {paper}
        <div className="relative">
          <div className="text-center text-[10px] tracking-[0.24em] uppercase">{PRIVACY_REVISION.mobile}</div>
          <Text as="h1" FONT="PAPER_DISPLAY" className="mt-2.5 text-center text-[clamp(30px,10.4vw,40px)] leading-[1.05]">
            Политика конфиденциальности
          </Text>
          <p className="mt-2.5 mb-3.5 text-center italic">Коротко, по пунктам и без мелкого шрифта.</p>
          {PRIVACY_SECTIONS.map((section, index) => (
            <details key={section.id} id={section.id} open={index === 0} className="group border-b border-label-ink/30">
              <summary className="flex min-h-13.5 cursor-pointer list-none items-center justify-between gap-2.5 font-paper-display text-[22px] [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="text-primary-500">§ {index + 1}.</span> {section.title.mobile}
                </span>
                <span aria-hidden="true" className="transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <ol className="m-0 mb-3.5 pl-6 text-sm leading-[1.55]">
                {section.items.map((item) => (
                  <li key={item.mobile}>{item.mobile}</li>
                ))}
              </ol>
            </details>
          ))}
          {operator}
        </div>
      </article>
    );
  }

  return (
    <div className="mx-auto mb-24 grid max-w-480 grid-cols-[minmax(280px,360px)_minmax(0,1fr)] items-start gap-14 px-10 2xl:px-30">
      <nav aria-label="Содержание" className="sticky top-25 rounded-3xl border border-cellar-700 bg-cellar-950/80 p-7.5">
        <Text as="span" FONT="FIRM" className="mb-2 block text-xl">
          Содержание
        </Text>
        {PRIVACY_SECTIONS.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="grid grid-cols-[40px_1fr] gap-2 border-b border-cellar-800 py-2.5 text-[17px] text-white no-underline transition-colors hover:text-amber-200"
          >
            <span className="text-amber-200">§ {index + 1}</span>
            <span>{section.title.desktop}</span>
          </a>
        ))}
        <span className="mt-4.5 block text-micro text-cellar-400">{PRIVACY_REVISION.desktop}</span>
      </nav>
      <article className="relative bg-document px-20 pt-16 pb-20 font-paper text-label-ink shadow-panel">
        {paper}
        <div aria-hidden="true" className="absolute inset-y-0 left-12.5 w-px bg-primary-500/40" />
        <div className="relative">
          <div className="text-center text-[15px] tracking-[0.3em] uppercase">Premium Wine Boutique · документ № 1</div>
          <Text as="h1" FONT="PAPER_DISPLAY" className="mt-4 text-center text-[76px] leading-[1.05]">
            Политика конфиденциальности
          </Text>
          <p className="mx-auto mt-4.5 max-w-205 text-center text-[22px] leading-normal italic">
            Как мы обращаемся с вашими данными — коротко, по пунктам и без мелкого шрифта.
          </p>
          <div aria-hidden="true" className="mx-auto mt-7 w-60 border-t-4 border-double border-label-ink" />
          {PRIVACY_SECTIONS.map((section, index) => (
            <section key={section.id} id={section.id} className="mt-8.5 scroll-mt-28 break-inside-avoid">
              <Text as="h2" FONT="PAPER_DISPLAY" className="text-[40px]">
                <span className="text-primary-500">§ {index + 1}.</span> {section.title.desktop}
              </Text>
              <ol className="m-0 mt-3 pl-8.5 text-md leading-[1.6]">
                {section.items.map((item) => (
                  <li key={item.desktop} className="mb-2">
                    {item.desktop}
                  </li>
                ))}
              </ol>
            </section>
          ))}
          {operator}
        </div>
      </article>
    </div>
  );
};

export default PrivacyDocument;
