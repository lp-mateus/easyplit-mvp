import { EventRepository } from "../domain/EventRepository";
import { PayerRepository } from "@/modules/payers/domain/PayerRepository";
import { ExpenseRepository } from "@/modules/expenses/domain/ExpenseRepository";
import { EventNotFoundError } from "../domain/errors";

export class DeleteEvent {
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly payerRepo: PayerRepository,
    private readonly expenseRepo: ExpenseRepository
  ) {}

  async execute(eventId: string): Promise<void> {
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    // Cascading delete in order: expenses & participants -> payers -> event
    await this.expenseRepo.deleteByEventId(eventId);
    await this.payerRepo.deleteByEventId(eventId);
    await this.eventRepo.delete(eventId);
  }
}
