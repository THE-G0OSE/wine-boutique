import { useState, type FC } from "react";
import { CERTIFICATE_FORMATS, DEFAULT_CERTIFICATE, type Certificate, type CertificateDraft } from "@/entities/certificate";
import { IssueCertificateForm } from "@/features/certificates/issueCertificate";
import { cn } from "@/shared/lib/cn";
import { boutiqueToday } from "@/shared/lib/date";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Eyebrow, Text } from "uikit;/";
import CertificateCard from "./components/certificateCard/CertificateCard";

const FACTS = [
  { title: "Год на выбор", text: "Действует 12 месяцев с даты покупки. Можно тратить частями." },
  { title: "На всё в бутике", text: "Бутылки, дегустации, аренда зала, набор месяца и ячейка в погребе." },
  { title: "Только 18+", text: "Получатель предъявляет паспорт при покупке алкоголя." },
];

/** «2026-10-20» → «2027-10-20»: срок действия на превью до оформления */
const yearFromToday = () => {
  const today = boutiqueToday();
  return `${Number(today.slice(0, 4)) + 1}${today.slice(4) === "-02-29" ? "-02-28" : today.slice(4)}`;
};

/**
 * Подарочные сертификаты (/certificates, макеты Certificates и MCertificates): живой сертификат и оформление
 * (POST /certificates); после оформления на бумаге — настоящий номер и срок
 */
const CertificateBuilder: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const variant = isDesktop ? "desktop" : "mobile";
  const [draft, setDraft] = useState<CertificateDraft>(DEFAULT_CERTIFICATE);
  const [issued, setIssued] = useState<Certificate | null>(null);

  const intro = (
    <section className={cn("flex flex-col", { "mx-auto max-w-480 gap-3.5 px-10 2xl:px-30": isDesktop, "gap-2.5 px-5": !isDesktop })}>
      <div className={cn("flex flex-col", { "max-w-215 gap-3.5": isDesktop, "gap-2.5": !isDesktop })}>
        <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
          {isDesktop ? "Подарочные сертификаты • Gift cards" : "Подарочные сертификаты"}
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
          Сертификат в погреб
        </Text>
        <Text COLOR="MUTED" className={cn({ "text-[21px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
          {isDesktop
            ? "Когда не знаете, какое вино выбрать, — подарите выбор. Сертификат действует на бутылки, дегустации и набор месяца целый год."
            : "Подарите выбор: бутылки, дегустации и набор месяца на целый год."}
        </Text>
      </div>
    </section>
  );

  const card = (
    <figure className={cn("m-0", { "pt-5": isDesktop })}>
      <CertificateCard
        draft={draft}
        serial={issued && issued.nominal === draft.nominal ? issued.serial : null}
        validUntil={issued?.validUntil ?? yearFromToday()}
        variant={variant}
      />
      {isDesktop ? <figcaption className="mt-15 text-sm text-neutral-350">{CERTIFICATE_FORMATS[draft.format].caption}</figcaption> : null}
    </figure>
  );

  const form = (
    <IssueCertificateForm
      draft={draft}
      onDraftChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
      onIssued={setIssued}
      variant={variant}
    />
  );

  const facts = isDesktop ? (
    <section aria-labelledby="certificate-facts" className="mx-auto my-24 max-w-480 px-10 2xl:px-30">
      <Text as="h2" id="certificate-facts" FONT="FIRM" className="text-display-sm leading-19">
        Как работает сертификат
      </Text>
      <ul className="m-0 mt-7 grid list-none grid-cols-3 gap-6 p-0">
        {FACTS.map((fact) => (
          <li key={fact.title} className="flex flex-col gap-2.5 rounded-3xl border border-cellar-700 bg-cellar-950/80 p-7.5">
            <span className="text-[21px] font-semibold text-amber-200">{fact.title}</span>
            <span className="text-[17px] leading-[1.55] text-neutral-350">{fact.text}</span>
          </li>
        ))}
      </ul>
    </section>
  ) : null;

  return (
    <>
      {intro}
      {isDesktop ? (
        <section aria-label="Оформление сертификата" className="mx-auto mt-12 grid max-w-480 grid-cols-[minmax(0,1fr)_minmax(420px,560px)] items-start gap-14 px-10 2xl:px-30">
          {card}
          {form}
        </section>
      ) : (
        <div className="mx-4 mt-5 mb-10 flex flex-col gap-9">
          {card}
          {form}
        </div>
      )}
      {facts}
    </>
  );
};

export default CertificateBuilder;
