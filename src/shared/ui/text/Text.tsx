import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { TextColor, TextFont, TextSize, TextStyle } from "./model/types";
import { motion } from "motion/react";

interface IProps {
  FONT?: TextFont;
  SIZE?: TextSize;
  STYLE?: TextStyle;
  COLOR?: TextColor;
  children: ReactNode;
  className?: string;
}

const propsToClass = {
  FONT: {
    REGULAR: "font-regular",
    FIRM: "font-firm",
    SYSTEM: "font-system",
  },
  SIZE: {
    FIRM: "text-4xl",
    H1: "text-3xl",
    H2: "text-2xl",
    H3: "text-xl",
    H4: "text-lg",
    P: "text-md",
    SYSTEM: "text-sm",
    SMALL: "text-xs",
  },
  STYLE: {
    NORMAL: "",
    SEMIBOLD: "font-semibold",
    BOLD: "font-bold",
    ITALIC: "italic",
  },
  COLOR: {
    WHITE: "text-white",
    BLACK: "text-black",
  },
};

const Text = forwardRef<HTMLParagraphElement, IProps>(
  (
    {
      className = "",
      FONT = "REGULAR",
      SIZE = "P",
      STYLE = "NORMAL",
      COLOR = "BLACK",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <p
        ref={ref}
        className={`${className} ${propsToClass.FONT[FONT]} ${propsToClass.SIZE[SIZE]} ${propsToClass.COLOR[COLOR]} ${propsToClass.STYLE[STYLE]}`}
        {...rest}
      >
        {children}
      </p>
    );
  }
);
Text.displayName = "Text"
const AnimatedText = motion.create(Text);

export default AnimatedText

