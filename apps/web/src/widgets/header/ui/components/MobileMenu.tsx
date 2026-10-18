import { motion } from "motion/react";
import type { FC } from "react";
import { Link, NavLink } from "react-router";
import { LuX } from "react-icons/lu";
import { useSession } from "@/entities/session";
import { CONTACTS } from "@/shared/config/contacts";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { ButtonLink, IconButton, Overlay } from "uikit;/";
import { MAIN_NAV, MOBILE_EXTRA_NAV } from "../../model/navigation";

interface IProps {
  open: boolean;
  onClose: () => void;
}

/** Полноэкранное меню мобильной шапки */
const MobileMenu: FC<IProps> = ({ open, onClose }) => {
  const { user } = useSession();

  return (
    <Overlay open={open} onClose={onClose} closeLabel="Закрыть меню" backdropClassName="bg-cellar-950 backdrop-blur-none">
      <motion.nav
        aria-label="Меню"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
        className="absolute inset-0 flex flex-col overflow-auto bg-cellar-950 bg-[radial-gradient(ellipse_380px_420px_at_20%_0%,rgba(210,140,60,0.18),transparent_70%)]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <span className="font-firm text-md">Premium Wine Boutique</span>
          <IconButton label="Закрыть меню" variant="outlineDark" onClick={onClose}>
            <LuX size={20} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="flex flex-col px-5 pt-4.5">
          {MAIN_NAV.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === ROUTES.home}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex min-h-15 items-center justify-between border-b border-cellar-800 font-firm text-xl no-underline",
                  isActive ? "text-amber-200" : "text-white"
                )
              }
            >
              <span>{link.label}</span>
              <span className="font-system text-[13px] text-cellar-400">{String(index + 1).padStart(2, "0")}</span>
            </NavLink>
          ))}
        </div>

        <ButtonLink to={user ? ROUTES.account : ROUTES.auth} onClick={onClose} className="mx-5 mt-5.5 h-13.5">
          {user ? "Личный кабинет" : "Войти или зарегистрироваться"}
        </ButtonLink>

        <div className="mt-4.5 grid grid-cols-2 gap-2.5 px-5">
          {MOBILE_EXTRA_NAV.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="flex min-h-12 items-center rounded-[14px] border border-cellar-800 bg-cellar-900 px-3.5 text-[15px] text-neutral-350 no-underline"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-1.5 px-5 pt-7 pb-7.5 text-[15px] text-neutral-350">
          <span>
            {CONTACTS.address} · {CONTACTS.hours}
          </span>
          <span className="font-system">{CONTACTS.phone}</span>
          <span className="mt-2.5 flex items-center gap-2.5 font-system text-xs uppercase">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-amber-200 font-semibold text-amber-200">
              18+
            </span>
            Чрезмерное употребление алкоголя вредит вашему здоровью
          </span>
        </div>
      </motion.nav>
    </Overlay>
  );
};

export default MobileMenu;
