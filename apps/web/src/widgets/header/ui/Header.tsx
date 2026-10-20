import { useState } from "react";
import { Link, NavLink, useMatch } from "react-router";
import { LuSearch } from "react-icons/lu";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { useScrollThreshold } from "@/shared/lib/hooks/useScrollThreshold";
import { iconButtonClasses } from "uikit;/";
import { HEADER_SOLID_AFTER, MAIN_NAV } from "../model/navigation";
import AccountLink from "./components/AccountLink";
import CartButton from "./components/CartButton";
import MobileMenu from "./components/MobileMenu";

/**
 * Шапка: наверху страницы — прозрачная поверх первого экрана, после 80px прокрутки — тёмная и ниже.
 * На главной логотип появляется только в тёмном состоянии: в hero уже есть крупное «Premium Wine Boutique».
 */
const Header = () => {
  const isSolid = useScrollThreshold(HEADER_SOLID_AFTER);
  const isHome = useMatch(ROUTES.home) !== null;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-16 bg-linear-to-b from-black/60 to-transparent transition-[height] duration-300 lg:from-black/55",
        isSolid ? "lg:h-20" : "lg:h-24"
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 border-b border-amber-200/15 bg-cellar-950/92 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[8px] transition-opacity duration-300",
          isSolid ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Мобильная шапка */}
      <div className="relative flex h-full items-center justify-between pr-4 pl-5 lg:hidden">
        <Link to={ROUTES.home} aria-label="Premium Wine Boutique — на главную" className="font-firm text-[17px] leading-6.5 text-white no-underline">
          Premium Wine Boutique
        </Link>
        <div className="flex items-center gap-2">
          <AccountLink className="border-amber-200/40 bg-cellar-950/50" />
          <CartButton variant="icon" />
          <button
            type="button"
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className={iconButtonClasses({ className: "flex-col gap-1.25 border-amber-200/40 bg-cellar-950/50" })}
          >
            <span className="h-0.5 w-4.5 rounded-full bg-white" />
            <span className="h-0.5 w-4.5 rounded-full bg-white" />
            <span className="ml-1.5 h-0.5 w-3 rounded-full bg-amber-200" />
          </button>
        </div>
      </div>

      {/* Десктопная шапка; на 1024–1279 всё чуть мельче — иначе логотип, меню и кнопки не помещаются в строку */}
      <div className="relative hidden h-full items-center justify-between gap-4 px-6 lg:flex xl:gap-6 xl:px-10 2xl:px-30">
        <Link
          to={ROUTES.home}
          aria-label="Premium Wine Boutique — на главную"
          className={cn(
            "font-firm text-md xl:text-[24px] leading-[1.45] whitespace-nowrap text-white no-underline transition-opacity duration-300 2xl:text-xl",
            isHome && !isSolid && "invisible opacity-0"
          )}
        >
          Premium Wine Boutique
        </Link>
        <nav aria-label="Основная навигация" className="flex items-center gap-4 xl:gap-6 2xl:gap-9">
          {MAIN_NAV.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  "border-b-2 pt-2.5 pb-1.5 text-micro font-semibold no-underline transition-colors xl:text-caption 2xl:text-md",
                  isActive ? "border-amber-200 text-amber-200" : "border-transparent text-white hover:text-amber-200"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to={ROUTES.shop} aria-label="Поиск по магазину" className={iconButtonClasses({})}>
            <LuSearch size={20} aria-hidden="true" />
          </Link>
          <AccountLink />
          <CartButton variant="pill" />
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
};

export default Header;
