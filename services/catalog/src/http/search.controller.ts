import { Controller, Get, Header, Query } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zGetSearchSuggestionsQuery, zGetSearchSuggestionsResponse } from "@wine/contracts/openapi/zod";
import { ContractResponse } from "@wine/service-kit";
import type { z } from "zod";
import { SuggestSearch } from "../application/shop.js";
import { toWineSummary } from "./contract-mappers.js";

@Controller("search")
export class SearchController {
  constructor(private readonly suggestSearch: SuggestSearch) {}

  /** GET /api/search/suggest — operationId getSearchSuggestions */
  @Get("suggest")
  @Header("Cache-Control", "public, max-age=60")
  @ContractResponse(zGetSearchSuggestionsResponse)
  async suggest(@Query({ schema: zGetSearchSuggestionsQuery }) { q }: z.output<typeof zGetSearchSuggestionsQuery>): Promise<components["schemas"]["SearchSuggestions"]> {
    const today = new Date();
    const suggestions = await this.suggestSearch.execute(q, today);
    return { ...suggestions, wines: suggestions.wines.map((wine) => toWineSummary(wine, today)) };
  }
}
