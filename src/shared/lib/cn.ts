import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge знает только стандартную шкалу Tailwind. Кастомные токены из @theme
 * перечислены здесь, иначе он примет, например, `text-display` за цвет и выкинет его при слиянии.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["md", "display-lg", "display", "display-sm", "title", "caption", "micro"],
      "inset-shadow": ["top", "top-sm", "card-bottom"],
      shadow: ["panel"],
      "text-shadow": ["glow"],
      animate: ["sway", "breathe", "flicker", "dust", "develop"],
      font: ["firm", "regular", "system", "paper", "paper-display"],
    },
  },
});

/** Склейка классов: условные — объектом (`{ "opacity-50": disabled }`), конфликты Tailwind решает последний класс */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
