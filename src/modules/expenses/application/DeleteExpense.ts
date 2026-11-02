import { ExpenseRepository } from "../domain/ExpenseRepository";
import { ExpenseNotFoundError } from "../domain/errors";

export class DeleteExpense {
  constructor(private readonly expenseRepo: ExpenseRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.expenseRepo.findById(id);
    if (!existing) {
      throw new ExpenseNotFoundError(id);
    }

    await this.expenseRepo.delete(id);
  }
}
