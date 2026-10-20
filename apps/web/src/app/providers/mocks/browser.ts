import { setupWorker } from "msw/browser";
import { boutiqueHandlers } from "@/entities/boutique/mocks";
import { cellarHandlers } from "@/entities/cellarCell/mocks";
import { grapeHandlers } from "@/entities/grapeVariety/mocks";
import { articleHandlers } from "@/entities/newsArticle/mocks";
import { monthlyHandlers } from "@/entities/monthlyCrate/mocks";
import { newsHandlers } from "@/entities/newsIssue/mocks";
import { reservationHandlers } from "@/entities/reservation/mocks";
import { reviewHandlers } from "@/entities/review/mocks";
import { sessionHandlers } from "@/entities/session/mocks";
import { tastingHandlers } from "@/entities/tasting/mocks";
import { wineHandlers } from "@/entities/wine/mocks";
import { requestCellHandlers } from "@/features/cellar/requestCell/mocks";
import { issueCertificateHandlers } from "@/features/certificates/issueCertificate/mocks";
import { requestGiftsHandlers } from "@/features/gifts/requestGifts/mocks";
import { requestHallHandlers } from "@/features/hall/requestHall/mocks";
import { subscribeMonthlyHandlers } from "@/features/monthly/subscribeMonthly/mocks";
import { newsletterHandlers } from "@/features/newsletter/subscribe/mocks";
import { createReservationHandlers } from "@/features/reservation/createReservation/mocks";
import { writeLetterHandlers } from "@/features/reviews/writeLetter/mocks";
import { bookTastingHandlers } from "@/features/tastings/bookTasting/mocks";

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
  ...createReservationHandlers,
  ...tastingHandlers,
  ...bookTastingHandlers,
  ...cellarHandlers,
  ...requestCellHandlers,
  ...requestHallHandlers,
  ...requestGiftsHandlers,
  ...monthlyHandlers,
  ...subscribeMonthlyHandlers,
  ...issueCertificateHandlers
);
