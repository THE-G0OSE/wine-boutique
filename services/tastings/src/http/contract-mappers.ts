import type { components } from "@wine/contracts/openapi";
import { toZonedIso } from "@wine/service-kit";
import { CELLAR_TIMEZONE, seatsLeft, statusOf, type Tasting } from "../domain/tasting.js";

type Schemas = components["schemas"];

/** Дегустация в формате контракта: время — по часам погреба, цена — в рублях */
export const toTastingContract = (tasting: Tasting, now: Date): Schemas["Tasting"] => ({
  id: tasting.id,
  kind: tasting.kind,
  title: tasting.title,
  description: tasting.description,
  startsAt: toZonedIso(tasting.startsAt, CELLAR_TIMEZONE),
  durationMinutes: tasting.durationMinutes,
  wines: tasting.wines,
  capacity: tasting.capacity,
  seatsLeft: seatsLeft(tasting),
  price: tasting.priceKopecks === null ? null : Math.round(tasting.priceKopecks / 100),
  host: tasting.host,
  status: statusOf(tasting, now),
});
