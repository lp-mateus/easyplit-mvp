import { Payer } from "./Payer";

export interface PayerRepository {
  findByEventId(eventId: string): Promise<Payer[]>;
  findById(id: string): Promise<Payer | null>;
  save(payer: Payer): Promise<void>;
  saveMany(payers: Payer[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByEventId(eventId: string): Promise<void>;
}
