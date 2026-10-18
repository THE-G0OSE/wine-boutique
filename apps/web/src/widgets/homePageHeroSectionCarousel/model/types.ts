import type { imageObj } from "@/entities/heroPageImages";
import type { useCarousel } from "./lib/hooks/useCarousel";

export type HeroCarousel = ReturnType<typeof useCarousel<imageObj>>;
