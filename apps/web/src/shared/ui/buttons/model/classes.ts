import { cn } from "@/shared/lib/cn";

export type ButtonVariant = "primary" | "outline" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const buttonVariantToClass: Record<ButtonVariant, string> = {
  primary: "rounded-full bg-amber-350 text-black font-semibold hover:bg-amber-200",
  outline: "rounded-full border border-cellar-700 bg-transparent text-white font-semibold hover:border-amber-350",
  link: "bg-transparent text-amber-200 underline underline-offset-4 hover:text-paper",
};

const buttonSizeToClass: Record<ButtonSize, string> = {
  sm: "h-11 px-5 text-sm",
  md: "h-13 px-7 text-sm",
  lg: "h-14 px-8 text-caption",
  xl: "h-15 px-8 text-caption",
};

/** Классы кнопки — общие для `<button>` и ссылок, оформленных кнопкой */
export const buttonClasses = ({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) =>
  cn(
    "inline-flex cursor-pointer items-center justify-center gap-2.5 font-regular no-underline transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
    "disabled:pointer-events-none disabled:bg-cellar-700 disabled:text-neutral-500",
    buttonVariantToClass[variant],
    variant !== "link" && buttonSizeToClass[size],
    className
  );

export type IconButtonVariant = "glass" | "outlineLight" | "outlineDark" | "paper";
export type IconButtonSize = "md" | "lg" | "xl";

const iconButtonVariantToClass: Record<IconButtonVariant, string> = {
  glass: "border border-amber-200/30 bg-cellar-950/35 text-white hover:border-amber-200/70",
  outlineLight: "border-2 border-white bg-transparent text-white hover:border-neutral-350",
  outlineDark: "border border-cellar-700 bg-transparent text-white hover:border-amber-350",
  paper: "border border-neutral-350 bg-white text-black hover:border-neutral-500",
};

const iconButtonSizeToClass: Record<IconButtonSize, string> = {
  md: "size-11",
  lg: "size-13",
  xl: "size-25",
};

export const iconButtonClasses = ({
  variant = "glass",
  size = "md",
  className,
}: {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
}) =>
  cn(
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0 transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
    iconButtonVariantToClass[variant],
    iconButtonSizeToClass[size],
    className
  );
