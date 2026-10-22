import { useState, type FC } from "react";
import { Link } from "react-router";
import { formatDots, LOYALTY_LEVEL_ORDER, LOYALTY_LEVELS, type Loyalty, type MyCertificate } from "@/entities/account";
import { useAddMyCertificateMutation } from "@/features/account/addCertificate";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { Button, Text } from "uikit;/";
import { PANEL } from "../../model/tabs";

interface IProps {
  loyalty: Loyalty;
  certificates: MyCertificate[];
}

const rub = new Intl.NumberFormat("ru-RU");

/** Бонусы и сертификаты: уровни клуба (текущий подсвечен), история начислений, сертификаты с остатком и добавление по номеру */
const BonusTab: FC<IProps> = ({ loyalty, certificates }) => {
  const [serial, setSerial] = useState("");
  const [add, { isLoading, error, data, reset }] = useAddMyCertificateMutation();
  const current = LOYALTY_LEVEL_ORDER.indexOf(loyalty.level);
  const normalized = serial.trim().toUpperCase();
  const valid = /^WB-\d{4}-\d{6}$/.test(normalized);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:gap-10">
      <div className="flex flex-col gap-5">
        <Text as="h2" FONT="FIRM" className="text-xl leading-10.5 lg:text-2xl lg:leading-13">
          Уровни клуба
        </Text>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {LOYALTY_LEVEL_ORDER.map((level, index) => (
            <div
              key={level}
              aria-current={index === current ? "true" : undefined}
              className={cn("flex flex-col gap-1.5 rounded-[18px] p-4 lg:p-5", {
                "border-2 border-amber-350 bg-amber-350/14": index === current,
                "border border-cellar-700 bg-cellar-950/80": index !== current,
                "opacity-70": index < current,
              })}
            >
              <span className="font-firm text-lg">{LOYALTY_LEVELS[level].title}</span>
              <span className="text-xs text-neutral-350">{LOYALTY_LEVELS[level].requirement}</span>
              <span className="font-system text-xl font-semibold text-amber-200">{LOYALTY_LEVELS[level].percent}</span>
              <span className="text-xs leading-normal text-neutral-350">{LOYALTY_LEVELS[level].perk}</span>
            </div>
          ))}
        </div>
        <Text as="h2" FONT="FIRM" className="mt-2 text-xl leading-10.5 lg:text-2xl lg:leading-13">
          История бонусов
        </Text>
        <ul className="m-0 flex list-none flex-col p-0">
          {loyalty.history.map((entry) => (
            <li key={entry.id} className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-3 border-b border-cellar-800 py-3 text-sm">
              <span className="text-neutral-350">{formatDots(entry.at).slice(0, 5)}</span>
              <span>{entry.title}</span>
              <span className={cn("font-system font-semibold", { "text-sage": entry.amount > 0, "text-primary-200": entry.amount < 0 })}>
                {entry.amount > 0 ? "+" : "−"}
                {rub.format(Math.abs(entry.amount))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <Text as="h2" FONT="FIRM" className="text-xl leading-10.5 lg:text-2xl lg:leading-13">
          Сертификаты
        </Text>
        {certificates.map((certificate) => (
          <div key={certificate.serial} className="flex flex-col gap-2 rounded-[18px] bg-paper p-5 font-paper text-label-ink shadow-ticket">
            <div className="flex justify-between text-micro tracking-[0.12em]">
              <span>№ {certificate.serial}</span>
              <span>до {formatDots(certificate.validUntil)}</span>
            </div>
            <div className="text-[34px] font-bold">
              {rub.format(certificate.balance)} ₽ <span className="text-sm font-normal text-paper-ink">из {rub.format(certificate.nominal)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-sm bg-label-ink/15">
              <span className="block h-full rounded-sm bg-amber-500" style={{ width: `${(certificate.balance / certificate.nominal) * 100}%` }} />
            </div>
            <div className="text-sm italic">от {certificate.from}</div>
          </div>
        ))}
        <form
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            if (!valid) return;
            const result = await add(normalized);
            if ("data" in result) setSerial("");
          }}
          className={cn(PANEL, "flex flex-col gap-3")}
        >
          <span className="font-semibold">Добавить сертификат</span>
          <div className="flex gap-2.5">
            <input
              type="text"
              aria-label="Номер сертификата"
              value={serial}
              onChange={(event) => {
                setSerial(event.target.value);
                if (error || data) reset();
              }}
              placeholder="WB-2026-000123"
              className="h-12 min-w-0 flex-1 rounded-[14px] border border-cellar-700 bg-cellar-950 px-4 font-system text-white uppercase outline-none placeholder:text-cellar-400 placeholder:normal-case focus:border-amber-350"
            />
            <Button type="submit" size="md" disabled={!valid || isLoading} className="h-12 shrink-0">
              Добавить
            </Button>
          </div>
          <span aria-live="polite" className={cn("text-micro", { "text-sage": data, "text-error": error, "text-cellar-400": !data && !error })}>
            {data ? "Сертификат добавлен ✓" : error ? (isApiError(error) ? error.data.message : "Не получилось — попробуйте ещё раз") : "Номер — на обороте сертификата или в письме"}
          </span>
          <Link to={ROUTES.certificates} className="text-sm text-amber-200 hover:text-paper">
            Подарить сертификат →
          </Link>
        </form>
      </div>
    </div>
  );
};

export default BonusTab;
