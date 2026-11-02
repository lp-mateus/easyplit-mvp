import { Expense } from "./Expense";

export interface ExpenseRepository {
  findByEventId(eventId: string): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  existsWithParticipant(payerId: string): Promise<boolean>;
  save(expense: Expense): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByEventId(eventId: string): Promise<void>;
}
