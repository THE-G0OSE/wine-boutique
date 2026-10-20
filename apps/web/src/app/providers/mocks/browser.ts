import { setupWorker } from "msw/browser";
import { boutiqueHandlers } from "@/entities/boutique/mocks";
import { grapeHandlers } from "@/entities/grapeVariety/mocks";
import { articleHandlers } from "@/entities/newsArticle/mocks";
import { newsHandlers } from "@/entities/newsIssue/mocks";
import { reservationHandlers } from "@/entities/reservation/mocks";
import { reviewHandlers } from "@/entities/review/mocks";
import { sessionHandlers } from "@/entities/session/mocks";
import { wineHandlers } from "@/entities/wine/mocks";
import { newsletterHandlers } from "@/features/newsletter/subscribe/mocks";
import { createReservationHandlers } from "@/features/reservation/createReservation/mocks";
import { writeLetterHandlers } from "@/features/reviews/writeLetter/mocks";

/** Мок-сервер в браузере: все обработчики контракта api/openapi.yaml */
export const worker = setupWorker(
  ...wineHandlers,
  ...grapeHandlers,
  ...sessionHandlers,
  ...newsHandlers,
  ...articleHandlers,
  ...reviewHandlers,
  ...newsletterHandlers,
  ...writeLetterHandlers,
  ...boutiqueHandlers,
  ...reservationHandlers,
  ...createReservationHandlers
);
