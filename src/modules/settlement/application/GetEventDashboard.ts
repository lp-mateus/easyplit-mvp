import { EventDashboardData } from "../domain/types";
import { CommitmentCalculator } from "../domain/CommitmentCalculator";
import { EventRepository } from "@/modules/events/domain/EventRepository";
import { PayerRepository } from "@/modules/payers/domain/PayerRepository";
import { ExpenseRepository } from "@/modules/expenses/domain/ExpenseRepository";
import { EventNotFoundError } from "@/modules/events/domain/errors";

export class GetEventDashboard {
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly payerRepo: PayerRepository,
    private readonly expenseRepo: ExpenseRepository
  ) {}

  async execute(eventId: string): Promise<EventDashboardData> {
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    const payers = await this.payerRepo.findByEventId(eventId);
    const expenses = await this.expenseRepo.findByEventId(eventId);

    return CommitmentCalculator.calculate({
      guestCount: event.guestCount,
      payers,
      expenses,
    });
  }
}
