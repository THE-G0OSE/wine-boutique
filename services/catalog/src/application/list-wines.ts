import { Injectable } from "@nestjs/common";
import { WineRepository, type WineListQuery, type WinePage } from "./ports.js";

/** Полки, поиск и каталог погреба: GET /wines */
@Injectable()
export class ListWines {
  constructor(private readonly wines: WineRepository) {}

  execute(query: WineListQuery): Promise<WinePage> {
    return this.wines.list(query);
  }
}
