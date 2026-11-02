import { Expense } from "../domain/Expense";
import { ExpenseRepository } from "../domain/ExpenseRepository";

export class ListExpensesByEvent {
  constructor(private readonly expenseRepo: ExpenseRepository) {}

  async execute(eventId: string): Promise<Expense[]> {
    return this.expenseRepo.findByEventId(eventId);
  }
}
