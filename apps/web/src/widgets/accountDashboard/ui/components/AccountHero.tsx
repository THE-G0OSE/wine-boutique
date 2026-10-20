import type { FC } from "react";
import { firstName, greeting, LOYALTY_LEVELS, type Loyalty, type Profile } from "@/entities/account";
import { formatCardNumber } from "@/entities/session";
import { cn } from "@/shared/lib/cn";
import { plural } from "@/shared/lib/plural";
import { Eyebrow, Text } from "uikit;/";
import type { AccountTab } from "../../model/tabs";

export interface IStat {
  value: string;
  label: string;
  tab: AccountTab;
}

interface IProps {
  profile: Profile;
  loyalty: Loyalty | undefined;
  stats: IStat[];
  onOpen: (tab: AccountTab) => void;
}

/** Верх кабинета: карта гостя с уровнем, приветствие, прогресс до следующего уровня и счётчики-ссылки на вкладки */
const AccountHero: FC<IProps> = ({ profile, loyalty, stats, onOpen }) => {
  const level = loyalty ? LOYALTY_LEVELS[loyalty.level].title : "Гость";
  const next = loyalty?.nextLevel;
  const left = next ? Math.max(0, next.bottles - loyalty.bottles) : 0;

  return (
    <section className="mx-auto grid max-w-480 gap-6 px-4 lg:grid-cols-[minmax(380px,540px)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:px-10 2xl:px-30">
      <div
        role="img"
        aria-label={`Карта гостя ${profile.cardNumber ? formatCardNumber(profile.cardNumber) : ""}, уровень «${level}»`}
        className="relative h-52 overflow-hidden rounded-[22px] border border-amber-200/55 bg-[linear-gradient(135deg,var(--color-cellar-900)_0%,var(--color-rack-800)_55%,var(--color-cellar-950)_100%)] shadow-panel lg:order-none lg:h-82.5"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgb(232_184_120/0.05)_0_2px,transparent_2px_9px)]" />
        <span className="absolute top-4 left-5 font-firm text-caption text-amber-200 lg:top-6.5 lg:left-7.5 lg:text-xl">Premium Wine Boutique</span>
        <span className="absolute top-11 left-5 text-xs tracking-[0.14em] text-neutral-350 uppercase lg:top-17 lg:left-7.5 lg:text-sm">Клуб гостей погреба</span>
        <span aria-hidden="true" className="absolute top-5 right-5 h-9 w-12 rounded-lg bg-[linear-gradient(135deg,var(--color-amber-200),var(--color-amber-500)_60%,var(--color-amber-200))] lg:top-7 lg:right-7.5 lg:h-11 lg:w-15" />
        <span className="absolute bottom-17 left-5 font-system text-lg tracking-[0.16em] text-paper lg:bottom-25 lg:left-7.5 lg:text-[26px]">
          {profile.cardNumber ? formatCardNumber(profile.cardNumber) : "•••• •••• ••••"}
        </span>
        <span className="absolute bottom-5 left-5 flex flex-col lg:bottom-7.5 lg:left-7.5">
          <span className="text-[11px] tracking-[0.14em] text-neutral-350 uppercase lg:text-xs">Гость</span>
          <span className="text-sm text-white lg:text-lg">{profile.name}</span>
        </span>
        <span className="absolute right-5 bottom-5 flex flex-col items-end lg:right-7.5 lg:bottom-7.5">
          <span className="text-[11px] tracking-[0.14em] text-neutral-350 uppercase lg:text-xs">Уровень</span>
          <span className="text-sm text-amber-200 lg:text-lg">{level}</span>
        </span>
      </div>

      <div className="flex flex-col gap-3 lg:gap-4">
        <Eyebrow size="sm" className="lg:hidden">
          Личный кабинет
        </Eyebrow>
        <Eyebrow className="max-lg:hidden" labelClassName="text-[22px]">
          Личный кабинет
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className="text-[38px] leading-13 text-shadow-lg lg:text-display lg:leading-20 lg:text-shadow-2xl">
          {greeting()}, {firstName(profile.name)}
        </Text>
        {loyalty && next ? (
          <div className="flex max-w-245 flex-col gap-2">
            <div className="flex justify-between gap-3 text-micro text-neutral-350 lg:text-sm">
              <span>
                До уровня «{LOYALTY_LEVELS[next.level].title}» — {left} {plural(left, ["бутылка", "бутылки", "бутылок"])}
              </span>
              <span className="font-system">
                {loyalty.bottles} / {next.bottles}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={loyalty.bottles}
              aria-valuemin={0}
              aria-valuemax={next.bottles}
              aria-label="Прогресс до следующего уровня"
              className="h-2 overflow-hidden rounded-full bg-cellar-800"
            >
              <span className="block h-full rounded-full bg-linear-to-r from-amber-500 to-amber-200" style={{ width: `${Math.min(100, (loyalty.bottles / next.bottles) * 100)}%` }} />
            </div>
          </div>
        ) : null}
        <div className="mt-1.5 grid max-w-245 grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3.5">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => onOpen(stat.tab)}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-0.5 rounded-[18px] border border-cellar-700 bg-cellar-950/80 px-4 py-3 text-left text-white transition-colors hover:border-amber-350/60",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 lg:px-5 lg:py-4"
              )}
            >
              <span className="font-system text-lg font-semibold text-amber-200 lg:text-xl">{stat.value}</span>
              <span className="text-xs text-neutral-350 lg:text-micro">{stat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccountHero;
