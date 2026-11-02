import { PayerRepository } from "../domain/PayerRepository";
import { ExpenseRepository } from "@/modules/expenses/domain/ExpenseRepository";
import { MinPayersRequiredError, PayerHasExpensesError, PayerNotFoundError } from "../domain/errors";

export interface DeletePayerInput {
  id: string;
  eventId: string;
}

export class DeletePayer {
  constructor(
    private readonly payerRepo: PayerRepository,
    private readonly expenseRepo: ExpenseRepository
  ) {}

  async execute(input: DeletePayerInput): Promise<void> {
    const payer = await this.payerRepo.findById(input.id);
    if (!payer) {
      throw new PayerNotFoundError(input.id);
    }

    // Invariant: Cannot delete payer participating in expenses
    const hasExpenses = await this.expenseRepo.existsWithParticipant(input.id);
    if (hasExpenses) {
      throw new PayerHasExpensesError();
    }

    // Invariant: An event must have at least 2 payers
    const currentPayers = await this.payerRepo.findByEventId(input.eventId);
    if (currentPayers.length <= 2) {
      throw new MinPayersRequiredError();
    }

    await this.payerRepo.delete(input.id);
  }
}
