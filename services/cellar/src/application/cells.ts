import { Injectable } from "@nestjs/common";
import { CellarError, CONSENT_VERSION, type Cell, type CellRequest, type StorageTerm } from "../domain/cell.js";
import { CellRepository } from "./ports.js";

/** Стена ячеек: GET /cellar/cells */
@Injectable()
export class ListCells {
  constructor(private readonly cells: CellRepository) {}

  execute(): Promise<Cell[]> {
    return this.cells.list();
  }
}

export interface CellRequestInput {
  cellNumber: string;
  term: StorageTerm;
  name: string;
  phone: string;
  email?: string;
  bottles?: number;
}

/** Заявка на ячейку: POST /cellar/requests — только на свободную; ячейку не занимает до договора */
@Injectable()
export class RequestCell {
  constructor(private readonly cells: CellRepository) {}

  async execute(input: CellRequestInput, now = new Date()): Promise<CellRequest> {
    const customerName = input.name.trim();
    const cell = await this.cells.find(input.cellNumber);
    if (!customerName || !cell) throw new CellarError("invalid_request", "Проверьте имя, телефон и выбранную ячейку");
    if (cell.status === "busy") throw new CellarError("cell_busy", "Эту ячейку уже заняли — выберите другую");
    return this.cells.createRequest({
      cellNumber: cell.number,
      term: input.term,
      customerName,
      phone: input.phone,
      email: input.email?.trim() || null,
      bottles: input.bottles ?? null,
      consentAt: now,
      consentVersion: CONSENT_VERSION,
    });
  }
}
