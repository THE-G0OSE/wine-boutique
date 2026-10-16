import type { FC } from "react";
import { Link } from "react-router";
import { LuUser } from "react-icons/lu";
import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { iconButtonClasses } from "uikit;/";

interface IProps {
  className?: string;
}

/** Гость — иконка входа; вошедший — кружок с инициалами, ведёт в кабинет */
const AccountLink: FC<IProps> = ({ className }) => {
  const { user } = useSession();

  if (user) {
    return (
      <Link
        to={ROUTES.account}
        aria-label="Личный кабинет"
        className={iconButtonClasses({
          className: cn("border-0 bg-linear-135 from-amber-200 to-amber-500 font-system text-micro font-semibold text-black", className),
        })}
      >
        {user.initials}
      </Link>
    );
  }

  return (
    <Link to={ROUTES.auth} aria-label="Войти" className={iconButtonClasses({ className })}>
      <LuUser size={20} aria-hidden="true" />
    </Link>
  );
};

export default AccountLink;
