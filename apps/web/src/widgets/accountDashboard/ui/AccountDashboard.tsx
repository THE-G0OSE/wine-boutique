import { useCallback, type FC } from "react";
import { useSearchParams } from "react-router";
import {
  useGetMyCellQuery,
  useGetMyCertificatesQuery,
  useGetMyFavoritesQuery,
  useGetMyLoyaltyQuery,
  useGetMyMonthlyQuery,
  useGetMyReservationsQuery,
  useGetMyTastingsQuery,
  useGetProfileQuery,
} from "@/entities/account";
import { useGetMonthlyCratesQuery } from "@/entities/monthlyCrate";
import { SignOutButton } from "@/features/auth/signOut";
import { cn } from "@/shared/lib/cn";
import { plural } from "@/shared/lib/plural";
import { Text } from "uikit;/";
import { ACCOUNT_TABS, isAccountTab, type AccountTab } from "../model/tabs";
import AccountHero, { type IStat } from "./components/AccountHero";
import BonusTab from "./components/BonusTab";
import CellTab from "./components/CellTab";
import FavoritesTab from "./components/FavoritesTab";
import OrdersTab from "./components/OrdersTab";
import OverviewTab from "./components/OverviewTab";
import ProfileTab from "./components/ProfileTab";

/**
 * Личный кабинет (/account, макеты Account и MAccount): карта гостя и прогресс уровня, вкладки (в URL `?tab=`) —
 * обзор, брони, ячейка, избранное и дегустации, бонусы и сертификаты, профиль. Данные — /me у сервисов-владельцев.
 */
const AccountDashboard: FC = () => {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab") ?? "";
  const tab: AccountTab = isAccountTab(raw) ? raw : "overview";
  const open = useCallback(
    (next: AccountTab) =>
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          if (next === "overview") updated.delete("tab");
          else updated.set("tab", next);
          return updated;
        },
        { preventScrollReset: true }
      ),
    [setParams]
  );

  const { data: profile, isError } = useGetProfileQuery();
  const { data: reservations } = useGetMyReservationsQuery();
  const { data: tastings } = useGetMyTastingsQuery();
  const { data: cell } = useGetMyCellQuery();
  const { data: monthly } = useGetMyMonthlyQuery();
  const { data: certificates } = useGetMyCertificatesQuery();
  const { data: loyalty } = useGetMyLoyaltyQuery();
  const { data: favorites } = useGetMyFavoritesQuery();
  const { data: crates } = useGetMonthlyCratesQuery();

  if (isError) {
    return (
      <Text COLOR="MUTED" className="mx-auto max-w-480 px-5 lg:px-30">
        Не получилось открыть кабинет — обновите страницу.
      </Text>
    );
  }
  if (!profile) {
    return (
      <Text COLOR="MUTED" className="mx-auto max-w-480 px-5 lg:px-30">
        Открываем кабинет…
      </Text>
    );
  }

  const active = reservations?.active ?? [];
  const upcoming = (tastings ?? []).filter((item) => item.tasting.status !== "past");
  const inCell = cell?.cell?.bottles.reduce((sum, bottle) => sum + bottle.qty, 0) ?? 0;
  const stats: IStat[] = [
    { value: String(active.length), label: plural(active.length, ["бронь ждёт в бутике", "брони ждут в бутике", "броней ждут в бутике"]), tab: "orders" },
    { value: String(inCell), label: plural(inCell, ["бутылка в ячейке", "бутылки в ячейке", "бутылок в ячейке"]), tab: "cell" },
    { value: loyalty ? new Intl.NumberFormat("ru-RU").format(loyalty.balance) : "—", label: "бонусов", tab: "bonus" },
    { value: String(upcoming.length), label: plural(upcoming.length, ["запись на дегустацию", "записи на дегустации", "записей на дегустации"]), tab: "favorites" },
  ];

  const panel = {
    overview: (
      <OverviewTab
        reservation={active[0]}
        loyalty={loyalty}
        cell={cell?.cell}
        tasting={upcoming[0]}
        monthly={monthly?.subscription}
        monthlyTheme={crates?.current.theme}
        onOpen={open}
      />
    ),
    orders: <OrdersTab active={active} history={reservations?.history ?? []} bonuses={loyalty?.history ?? []} />,
    cell: <CellTab cell={cell?.cell ?? null} />,
    favorites: <FavoritesTab tastings={tastings ?? []} monthly={monthly?.subscription ?? null} favorites={favorites ?? []} />,
    bonus: loyalty ? <BonusTab loyalty={loyalty} certificates={certificates ?? []} /> : null,
    profile: <ProfileTab key={profile.id} profile={profile} />,
  }[tab];

  return (
    <>
      <AccountHero profile={profile} loyalty={loyalty} stats={stats} onOpen={open} />
      <div className="mx-auto mt-8 flex max-w-480 items-center gap-3 px-4 lg:mt-10 lg:px-10 2xl:px-30">
        <nav role="tablist" aria-label="Разделы кабинета" className="-mx-4 flex flex-1 gap-1 overflow-x-auto overflow-y-hidden px-4 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
          {ACCOUNT_TABS.map((item) => {
            const selected = item.id === tab;
            const badge = item.id === "orders" && active.length ? active.length : null;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => open(item.id)}
                className={cn(
                  "inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border-0 px-4.5 text-sm font-semibold transition-colors lg:h-12 lg:px-5.5",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
                  { "bg-amber-350 text-black": selected, "bg-transparent text-neutral-350 hover:text-white": !selected }
                )}
              >
                {item.title}
                {badge ? <span className={cn("rounded-full px-2 text-xs", { "bg-black/20": selected, "bg-primary-500 text-white": !selected })}>{badge}</span> : null}
              </button>
            );
          })}
        </nav>
        <SignOutButton className="h-11 shrink-0 max-lg:hidden" />
      </div>
      <div role="tabpanel" aria-label={ACCOUNT_TABS.find((item) => item.id === tab)?.title} className="mx-auto mt-6 mb-16 max-w-480 px-4 lg:mt-8 lg:mb-24 lg:px-10 2xl:px-30">
        {panel}
        <SignOutButton className="mt-8 h-12 w-full lg:hidden" />
      </div>
    </>
  );
};

export default AccountDashboard;
