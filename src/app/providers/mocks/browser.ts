import { setupWorker } from "msw/browser";
import { grapeHandlers } from "@/entities/grapeVariety/mocks";
import { sessionHandlers } from "@/entities/session/mocks";
import { wineHandlers } from "@/entities/wine/mocks";
import { newsletterHandlers } from "@/features/newsletter/subscribe/mocks";

/** Мок-сервер в браузере: все обработчики контракта api/openapi.yaml */
export const worker = setupWorker(...wineHandlers, ...grapeHandlers, ...sessionHandlers, ...newsletterHandlers);
