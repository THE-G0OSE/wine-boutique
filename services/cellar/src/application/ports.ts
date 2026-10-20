import type { Cell, CellRequest, StorageTerm } from "../domain/cell.js";

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
}
