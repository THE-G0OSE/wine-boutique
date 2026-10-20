import { useState, type FC, type ReactNode } from "react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { boutiqueToday } from "@/shared/lib/date";
import { Button, Text } from "uikit;/";
import { daysInMonth, isAdult, MONTHS } from "../../model/format";

export interface IRegistrationValues {
  name: string;
  birthDate: string;
  email: string;
  marketing: boolean;
}

interface IProps {
  variant: "desktop" | "mobile";
  error: string | null;
  busy: boolean;
  onSubmit: (values: IRegistrationValues) => void;
}

/** Знакомимся: имя, дата рождения (кабинет — с 18), почта, согласия → карта гостя */
const RegistrationStep: FC<IProps> = ({ variant, error, busy, onSubmit }) => {
  const isDesktop = variant === "desktop";
  const today = boutiqueToday();
  const thisYear = Number(today.slice(0, 4));
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [personalData, setPersonalData] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const complete = day && month && year;
  const birthDate = complete ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : "";
  const adult = complete ? isAdult(birthDate, today) : null;
  const emailOk = !email.trim() || /^\S+@\S+\.\S+$/.test(email.trim());
  const ready = name.trim().length > 0 && adult === true && personalData && emailOk && !busy;
  const days = daysInMonth(Number(year) || 2000, Number(month) || 1);

  const label = cn("flex min-w-0 flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop });
  const field = cn(
    "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 font-system text-white outline-none transition-colors placeholder:text-cellar-400 focus:border-amber-350",
    { "h-14 px-4.5 text-[17px]": isDesktop, "h-13 px-4 text-sm": !isDesktop }
  );
  const checkbox = (checked: boolean, onChange: (value: boolean) => void, text: ReactNode) => (
    <label className={cn("flex min-h-10 cursor-pointer items-start gap-3 text-white", { "text-[15px]": isDesktop, "text-micro": !isDesktop })}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="flex size-6.5 shrink-0 items-center justify-center rounded-lg border-2 border-amber-350 font-bold text-black peer-checked:bg-amber-350 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-200"
      >
        {checked ? "✓" : ""}
      </span>
      <span>{text}</span>
    </label>
  );

  return (
    <form
      noValidate
      aria-labelledby="auth-title"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSubmit({ name: name.trim(), birthDate, email: email.trim(), marketing });
      }}
      className={cn("flex flex-col", { "gap-4.5": isDesktop, "gap-3.5": !isDesktop })}
    >
      <Text as="h2" id="auth-title" FONT="FIRM" className={cn({ "text-title leading-15": isDesktop, "text-[32px] leading-11.5": !isDesktop })}>
        Знакомимся
      </Text>
      {isDesktop ? (
        <Text COLOR="MUTED" className="text-[17px]">
          Номер подтверждён. Осталось пара строк — и карта гостя готова.
        </Text>
      ) : null}
      <label className={label}>
        <span>Как к вам обращаться</span>
        <input type="text" autoComplete="name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Имя" className={field} />
      </label>
      <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
        <legend className={cn("mb-2 p-0 text-neutral-350", { "text-sm": isDesktop, "text-micro": !isDesktop })}>Дата рождения</legend>
        <div className={cn("grid grid-cols-[1fr_1.6fr_1.2fr]", { "gap-2.5": isDesktop, "gap-2": !isDesktop })}>
          <select aria-label="День" value={day} onChange={(event) => setDay(event.target.value)} className={cn(field, "cursor-pointer")}>
            <option value="">дд</option>
            {Array.from({ length: days }, (_, index) => String(index + 1)).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select aria-label="Месяц" value={month} onChange={(event) => setMonth(event.target.value)} className={cn(field, "cursor-pointer")}>
            <option value="">месяц</option>
            {MONTHS.map((title, index) => (
              <option key={title} value={String(index + 1)}>
                {title}
              </option>
            ))}
          </select>
          <select aria-label="Год" value={year} onChange={(event) => setYear(event.target.value)} className={cn(field, "cursor-pointer")}>
            <option value="">гггг</option>
            {Array.from({ length: 100 }, (_, index) => String(thisYear - 14 - index)).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        {adult === null ? null : (
          <span aria-live="polite" className={cn("text-micro", { "text-sage": adult, "text-primary-200": !adult })}>
            {adult ? "✓ Вам больше 18 — добро пожаловать. Паспорт попросим при первой выдаче заказа." : "Кабинет доступен только с 18 лет."}
          </span>
        )}
      </fieldset>
      {isDesktop ? (
        <label className={label}>
          <span>E-mail (необязательно)</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="для квитанций и анонсов"
            aria-invalid={emailOk ? undefined : true}
            className={cn(field, "aria-invalid:border-error")}
          />
        </label>
      ) : null}
      {checkbox(
        personalData,
        setPersonalData,
        <>
          Согласен с{" "}
          <Link to={ROUTES.privacy} className="text-amber-200 hover:text-paper">
            обработкой персональных данных
          </Link>
        </>
      )}
      {checkbox(marketing, setMarketing, "Хочу получать анонсы поставок и дегустаций")}
      <Button type="submit" size="xl" disabled={!ready} aria-busy={busy || undefined} className={cn("w-full", { "h-13.5 text-[17px]": !isDesktop })}>
        {busy ? "Заводим карту…" : "Создать карту гостя"}
      </Button>
      {error ? (
        <Text role="alert" SIZE="SYSTEM" className="text-center text-error">
          {error}
        </Text>
      ) : null}
    </form>
  );
};

export default RegistrationStep;
