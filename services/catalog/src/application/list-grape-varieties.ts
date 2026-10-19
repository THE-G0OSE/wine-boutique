import { Injectable } from "@nestjs/common";
import { MAX_WINES_PER_VARIETY, type GrapeVariety } from "../domain/grape-variety.js";
import { GrapeVarietyRepository } from "./ports.js";

/** Сорта с собственных плантаций и их вина: GET /grapes */
@Injectable()
export class ListGrapeVarieties {
  constructor(private readonly varieties: GrapeVarietyRepository) {}

  async execute(): Promise<GrapeVariety[]> {
    const varieties = await this.varieties.listWithWines();
    return varieties.map((variety) => ({ ...variety, wines: variety.wines.slice(0, MAX_WINES_PER_VARIETY) }));
  }
}
