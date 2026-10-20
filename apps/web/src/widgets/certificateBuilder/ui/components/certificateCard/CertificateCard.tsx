import type { FC } from "react";
import { CERTIFICATE_MIN, CERTIFICATE_SAMPLE, formatValidUntil, rublesInWords, type CertificateDraft } from "@/entities/certificate";
import { cn } from "@/shared/lib/cn";

interface IProps {
  draft: CertificateDraft;
  /** Номер после оформления; до него — плейсхолдер */
  serial: string | null;
  validUntil: string;
  variant: "desktop" | "mobile";
}

/** Ширина «ценной бумаги» в макете: Certificates — 1104 px, MCertificates — 358 */
const FIGURE = { desktop: 1104, mobile: 358 };

/**
 * Живой сертификат-«ценная бумага»: гильош, рамка, номинал прописью, кому и от кого, пожелание, срок и сургучная печать.
 * Размеры — из макета в долях ширины (`cqw`), чтобы бумага сжималась целиком.
 */
const CertificateCard: FC<IProps> = ({ draft, serial, validUntil, variant }) => {
  const isDesktop = variant === "desktop";
  const px = (value: number) => `${(value / FIGURE[variant]) * 100}cqw`;
  const nominal = draft.nominal === null ? "[сумма]" : new Intl.NumberFormat("ru-RU").format(draft.nominal);
  const words = draft.nominal === null ? `любая сумма от ${new Intl.NumberFormat("ru-RU").format(CERTIFICATE_MIN)} ₽` : rublesInWords(draft.nominal);

  return (
    <div className="@container">
      <div
        className={cn("relative box-border bg-paper font-paper text-label-ink shadow-panel", { "-rotate-[1.2deg]": isDesktop, "-rotate-1": !isDesktop })}
        style={{ height: px(isDesktop ? 620 : 300), padding: px(isDesktop ? 18 : 10) }}
      >
        {/* Гильош: сетка ромбов и волны от краёв */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_0%_50%,rgb(143_12_12/0.10)_0_1px,transparent_1px_7px),repeating-radial-gradient(circle_at_100%_50%,rgb(143_12_12/0.10)_0_1px,transparent_1px_7px),repeating-linear-gradient(60deg,rgb(158_101_36/0.08)_0_1px,transparent_1px_6px),repeating-linear-gradient(-60deg,rgb(158_101_36/0.08)_0_1px,transparent_1px_6px)]"
        />
        <div
          className="relative box-border flex h-full flex-col border-2 border-amber-500 outline outline-offset-[-10px] outline-amber-500"
          style={{ padding: isDesktop ? `${px(44)} ${px(64)}` : `${px(16)} ${px(18)}` }}
        >
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full bg-[repeating-conic-gradient(from_0deg,rgb(143_12_12/0.07)_0deg_2deg,transparent_2deg_6deg)] [mask:radial-gradient(circle,transparent_26%,black_26.2%,black_49.6%,transparent_49.8%)]"
            style={{ width: px(isDesktop ? 460 : 200), height: px(isDesktop ? 460 : 200) }}
          />
          <div className="relative flex items-start justify-between">
            <span className="font-firm" style={{ fontSize: px(isDesktop ? 30 : 14), lineHeight: 1.45 }}>
              Premium Wine Boutique
            </span>
            <span className="tracking-[0.2em]" style={{ fontSize: px(isDesktop ? 15 : 9) }}>
              № {serial ?? (isDesktop ? `WB-${Number(validUntil.slice(0, 4)) - 1}-[номер]` : "WB-[номер]")}
            </span>
          </div>
          <div className="relative text-center tracking-[0.5em] text-primary-500 uppercase" style={{ marginTop: px(isDesktop ? 18 : 8), fontSize: px(isDesktop ? 22 : 10) }}>
            Подарочный сертификат
          </div>
          <div className="relative text-center leading-none font-bold tracking-[0.02em]" style={{ marginTop: px(isDesktop ? 14 : 6), fontSize: px(isDesktop ? 120 : 56) }}>
            {nominal}
            <span style={{ fontSize: px(isDesktop ? 54 : 26) }}> ₽</span>
          </div>
          <div className="relative text-center italic" style={{ marginTop: px(6), fontSize: px(isDesktop ? 22 : 11) }}>
            {words}
          </div>
          <div className="relative mt-auto grid grid-cols-2" style={{ gap: px(isDesktop ? 40 : 14) }}>
            {[
              ["кому", draft.to.trim() || CERTIFICATE_SAMPLE.to],
              ["от кого", draft.from.trim() || CERTIFICATE_SAMPLE.from],
            ].map(([label, value]) => (
              <div key={label} className="flex min-w-0 flex-col gap-1">
                <span className="tracking-[0.2em] text-paper-ink uppercase" style={{ fontSize: px(isDesktop ? 14 : 8) }}>
                  {label}
                </span>
                <span className="truncate border-b border-label-ink italic" style={{ fontSize: px(isDesktop ? 30 : 14), paddingBottom: px(4) }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          {isDesktop ? (
            <div className="relative leading-[1.4] italic" style={{ marginTop: px(18), fontSize: px(19), minHeight: px(54) }}>
              {draft.message.trim() || CERTIFICATE_SAMPLE.message}
            </div>
          ) : null}
          <div className="relative flex justify-between text-paper-ink" style={{ marginTop: px(10), fontSize: px(isDesktop ? 14 : 8) }}>
            <span>Действителен до {formatValidUntil(validUntil)}</span>
            <span>Только для лиц старше 18 лет</span>
          </div>
        </div>
        {/* Сургучная печать */}
        <div
          aria-hidden="true"
          className="absolute flex items-center justify-center rounded-[47%_53%_50%_48%] bg-[radial-gradient(circle_at_38%_34%,var(--color-primary-200),var(--color-primary-500)_55%,var(--color-primary-800))] font-firm text-white/55 shadow-tag"
          style={{ right: px(isDesktop ? 70 : 20), bottom: px(isDesktop ? -34 : -16), width: px(isDesktop ? 110 : 52), height: px(isDesktop ? 110 : 52), fontSize: px(isDesktop ? 40 : 20) }}
        >
          W
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
