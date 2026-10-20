import type { Cell, CellRequest, MyCell, StorageTerm } from "../domain/cell.js";

export interface NewCellRequestRecord {
  cellNumber: string;
  term: StorageTerm;
  customerName: string;
  phone: string;
  email: string | null;
  bottles: number | null;
  consentAt: Date;
  consentVersion: string;
}

export abstract class CellRepository {
  /** Стена: по рядам сверху вниз, в ряду слева направо */
  abstract list(): Promise<Cell[]>;
  abstract find(number: string): Promise<Cell | null>;
  abstract createRequest(record: NewCellRequestRecord): Promise<CellRequest>;
  /** Ячейка гостя по договору хранения; нет договора — null */
  abstract findLease(userId: string): Promise<(MyCell & { leaseId: string }) | null>;
  /** Отметить бутылки к визиту (новая подготовка заменяет прошлую) */
  abstract savePreparation(leaseId: string, bottleIds: string[], visitAt: Date): Promise<void>;
}
