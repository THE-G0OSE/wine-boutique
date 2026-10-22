import { Link } from "react-router";
import { SubscribeForm } from "@/features/newsletter/subscribe";
import { CONTACTS } from "@/shared/config/contacts";
import { ROUTES } from "@/shared/config/routes";
import { FOOTER_COLUMNS } from "../model/links";
import { env } from "@/shared/config/env";

const columnTitle = "font-system text-[13px] font-semibold tracking-[0.08em] text-amber-200 uppercase";
const footerLink = "text-sm text-neutral-350 no-underline transition-colors hover:text-amber-200 lg:text-caption";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-cellar-950 px-5 pt-14 pb-7 lg:px-10 lg:pt-24 lg:pb-0 2xl:px-30">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_300px_220px_at_10%_0%,rgba(210,140,60,0.16),transparent_70%)] shadow-[inset_0_60px_50px_rgba(0,0,0,0.6)] lg:bg-[radial-gradient(ellipse_900px_420px_at_18%_0%,rgba(210,140,60,0.14),transparent_70%)] lg:shadow-[inset_0_90px_80px_rgba(0,0,0,0.6)]"
      />

      <div className="relative flex flex-col gap-6.5 lg:flex-row lg:items-end lg:justify-between lg:gap-20 lg:border-b lg:border-cellar-700 lg:pb-12">
        <div className="flex flex-col gap-2 lg:gap-2.5">
          <span className="font-firm text-2xl leading-13 lg:text-display lg:leading-23">Premium Wine Boutique</span>
          <span className="text-sm text-neutral-350 lg:text-md">Редкие вина из частных коллекций и собственных погребов.</span>
        </div>
        <SubscribeForm layout="stack" className="lg:hidden" />
        <SubscribeForm layout="row" className="hidden w-150 shrink-0 lg:flex" />
      </div>

      {/* Мобильные: разделы-аккордеоны */}
      <nav aria-label="Карта сайта" className="relative mt-7 border-t border-cellar-800 lg:hidden">
        {FOOTER_COLUMNS.map((column) => (
          <details key={column.title} className="group border-b border-cellar-800">
            <summary className={`flex min-h-13 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden ${columnTitle}`}>
              {column.title}
              <span aria-hidden="true" className="transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="flex flex-col gap-3 pb-4">
              {column.links.map((link) => (
                <Link key={link.label} to={link.to} className={footerLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        ))}
      </nav>

      {/* Десктоп: колонки */}
      <nav aria-label="Карта сайта" className="relative hidden grid-cols-5 gap-10 pt-12 lg:grid">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3.5">
            <span className={columnTitle}>{column.title}</span>
            {column.links.map((link) => (
              <Link key={link.label} to={link.to} className={footerLink}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="flex flex-col gap-3.5 text-caption text-neutral-350">
          <span className={columnTitle}>Контакты</span>
          <span>{CONTACTS.address}</span>
          <span className="font-system">{CONTACTS.phone}</span>
          <span>{CONTACTS.email}</span>
          <span>{CONTACTS.hours}</span>
        </div>
      </nav>

      <address className="relative mt-5.5 flex flex-col gap-1.5 text-[15px] text-neutral-350 not-italic lg:hidden">
        <span>{CONTACTS.address}</span>
        <span className="font-system">{CONTACTS.phone}</span>
        <span>
          {CONTACTS.email} · {CONTACTS.hours}
        </span>
      </address>

      <div className="relative mt-6 flex flex-col gap-3 border-t border-cellar-800 pt-4.5 lg:mt-12 lg:min-h-30 lg:justify-center lg:border-cellar-700 lg:py-0">
        <div className="flex items-center gap-3 lg:gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-200 font-system text-[13px] font-semibold text-amber-200 lg:size-11 lg:text-micro">
            18+
          </span>
          <span className="font-system text-xs leading-[1.4] font-semibold tracking-[0.04em] text-neutral-350 uppercase lg:text-sm">
            Чрезмерное употребление алкоголя вредит вашему здоровью
          </span>
        </div>
        <div className="flex flex-col gap-1.5 font-system text-xs text-neutral-350 lg:flex-row lg:flex-wrap lg:gap-x-7 lg:gap-y-2 lg:text-[13px]">
          <span>© 2026 Wine Boutique · портфолио-проект</span>
          <span>
            Фото рваной бумаги:{" "}
            <a href="https://www.vecteezy.com/free-png/ripped" className="text-neutral-350 hover:text-amber-200">
              Ripped PNGs by Vecteezy
            </a>
          </span>
          <Link to={ROUTES.privacy} className="text-neutral-350 hover:text-amber-200">
            Политика конфиденциальности
          </Link>
          {env.monitoringUrl ? (
            <a href={env.monitoringUrl} target="_blank" rel="noopener" aria-label="Мониторинг сервера (откроется в новой вкладке)" className="text-neutral-350 hover:text-amber-200">
              Мониторинг
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
