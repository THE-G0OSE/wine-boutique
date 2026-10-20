import { Injectable } from "@nestjs/common";
import {
  CellarError,
  CONSENT_VERSION,
  PREPARATION_HORIZON_MS,
  PREPARATION_LEAD_MS,
  type Cell,
  type CellRequest,
  type MyCell,
  type StorageTerm,
} from "../domain/cell.js";
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

/** Моя ячейка: GET /me/cell и подготовка к визиту POST /me/cell/prepare */
@Injectable()
export class MyCellUseCase {
  constructor(private readonly cells: CellRepository) {}

  /** Прошедшая подготовка уже не нужна — не показываем */
  async get(userId: string, now = new Date()): Promise<MyCell | null> {
    const lease = await this.cells.findLease(userId);
    if (!lease) return null;
    const { leaseId: _leaseId, ...cell } = lease;
    return { ...cell, preparation: cell.preparation && cell.preparation.visitAt > now ? cell.preparation : null };
  }

  async prepare(userId: string, bottleIds: string[], visitAt: Date, now = new Date()): Promise<void> {
    const lease = await this.cells.findLease(userId);
    if (!lease) throw new CellarError("not_found", "Ячейки нет");
    const known = new Set(lease.bottles.map((bottle) => bottle.id));
    if (!bottleIds.every((id) => known.has(id))) throw new CellarError("invalid_preparation", "Таких бутылок нет в описи");
    if (visitAt.getTime() < now.getTime() + PREPARATION_LEAD_MS || visitAt.getTime() > now.getTime() + PREPARATION_HORIZON_MS) {
      throw new CellarError("invalid_preparation", "Визит — не раньше чем через 2 часа и не дальше 30 дней");
    }
    await this.cells.savePreparation(lease.leaseId, [...new Set(bottleIds)], visitAt);
  }
}
