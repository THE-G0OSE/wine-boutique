import { useState, type FC, type KeyboardEvent } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  min: number | undefined;
  max: number | undefined;
  onChange: (min: number | undefined, max: number | undefined) => void;
  /** popover — поля в выпадающей панели (десктоп), sheet — в шторке фильтров (мобильные) */
  variant: "popover" | "sheet";
}

const parse = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : undefined;
};

/**
 * Цена от и до, ₽. Применяется, когда поле теряет фокус или по Enter — не на каждую цифру.
 * Пока у вин нет цен, подсказки в полях — плейсхолдеры макета.
 */
const PriceFields: FC<IProps> = ({ min, max, onChange, variant }) => {
  const [draft, setDraft] = useState({ min: min?.toString() ?? "", max: max?.toString() ?? "" });
  // Значения из URL поменялись снаружи (сброс) — показываем их
  const [synced, setSynced] = useState({ min, max });
  if (synced.min !== min || synced.max !== max) {
    setSynced({ min, max });
    setDraft({ min: min?.toString() ?? "", max: max?.toString() ?? "" });
  }

  const apply = () => onChange(parse(draft.min), parse(draft.max));
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") apply();
  };

  const input = cn("w-full min-w-0 border border-cellar-700 bg-cellar-950 font-system text-sm text-white outline-none placeholder:text-cellar-400 focus:border-amber-350", {
    "h-11 rounded-xl px-3.5": variant === "popover",
    "h-13 rounded-[14px] px-4": variant === "sheet",
  });

  const field = (key: "min" | "max", label: string, placeholder: string) => (
    <label className={cn("flex flex-col gap-1", { "text-xs text-cellar-400": variant === "popover" })}>
      <span className={cn({ "sr-only": variant === "sheet" })}>{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={draft[key]}
        placeholder={placeholder}
        aria-label={variant === "sheet" ? `Цена ${label}` : undefined}
        onChange={(event) => setDraft((prev) => ({ ...prev, [key]: event.target.value.replace(/\D/g, "") }))}
        onBlur={apply}
        onKeyDown={onKeyDown}
        className={input}
      />
    </label>
  );

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {field("min", "от", "[мин]")}
      {field("max", "до", "[макс]")}
    </div>
  );
};

export default PriceFields;
