import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import type { TextColor, TextFont, TextSize, TextStyle, TextTag } from "./model/types";
import { motion } from "motion/react";
import { cn } from "@/shared/lib/cn";

interface IProps extends HTMLAttributes<HTMLElement> {
  /** Семантический тег; по умолчанию `p` */
  as?: TextTag;
  FONT?: TextFont;
  SIZE?: TextSize;
  STYLE?: TextStyle;
  COLOR?: TextColor;
  children: ReactNode;
}

const propsToClass = {
  FONT: {
    REGULAR: "font-regular",
    FIRM: "font-firm font-normal",
    SYSTEM: "font-system",
  },
  SIZE: {
    FIRM: "text-4xl",
    DISPLAY_LG: "text-display-lg",
    DISPLAY: "text-display",
    DISPLAY_SM: "text-display-sm",
    TITLE: "text-title",
    H1: "text-3xl",
    H2: "text-2xl",
    H3: "text-xl",
    H4: "text-lg",
    P: "text-md",
    CAPTION: "text-caption",
    SYSTEM: "text-sm",
    MICRO: "text-micro",
    SMALL: "text-xs",
  },
  STYLE: {
    NORMAL: "",
    SEMIBOLD: "font-semibold",
    BOLD: "font-bold",
    ITALIC: "italic",
  },
  COLOR: {
    INHERIT: "",
    WHITE: "text-white",
    BLACK: "text-black",
    MUTED: "text-neutral-350",
    SUBTLE: "text-neutral-500",
    ACCENT: "text-amber-200",
    INK_MUTED: "text-neutral-650",
  },
};

const Text = forwardRef<HTMLElement, IProps>(
  (
    {
      as = "p",
      className,
      FONT = "REGULAR",
      SIZE = "P",
      STYLE = "NORMAL",
      COLOR = "INHERIT",
      children,
      ...rest
    },
    ref
  ) => {
    const Tag = as as ElementType;
    return (
      <Tag
        ref={ref}
        className={cn(
          "m-0",
          propsToClass.FONT[FONT],
          propsToClass.SIZE[SIZE],
          propsToClass.COLOR[COLOR],
          propsToClass.STYLE[STYLE],
          className
        )}
        {...rest}
      >
        {children}
      </Tag>
    );
  }
);
Text.displayName = "Text"
const AnimatedText = motion.create(Text);

export default AnimatedText
