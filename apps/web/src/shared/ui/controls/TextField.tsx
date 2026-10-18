import type { FC, InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/** Тёмное поле-пилюля (подписка, формы на тёмном фоне) */
const TextField: FC<IProps> = ({ invalid = false, className, ...props }) => {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "h-13 min-w-0 rounded-full border border-cellar-700 bg-cellar-900 px-5 font-system text-sm text-white",
        "placeholder:text-neutral-500 outline-none transition-colors focus:border-amber-350",
        { "border-error focus:border-error": invalid },
        className
      )}
      {...props}
    />
  );
};

export default TextField;
