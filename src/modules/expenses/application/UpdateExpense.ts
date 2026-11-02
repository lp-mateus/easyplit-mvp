import { Expense } from "../domain/Expense";
import { ExpenseRepository } from "../domain/ExpenseRepository";
import { ExpenseCategory } from "../domain/ExpenseCategory";
import { ExpenseStatus } from "../domain/ExpenseStatus";
import { ExpenseNotFoundError } from "../domain/errors";
import { PayerRepository } from "@/modules/payers/domain/PayerRepository";
import { ValidationError } from "@/shared/domain/DomainError";

export interface UpdateExpenseInput {
  id: string;
  eventId: string;
  name: string;
  supplier?: string;
  category: ExpenseCategory;
  amountCents: number;
  notes?: string;
  expenseDate: string;
  status: ExpenseStatus;
  payerId: string | null;
  paidAt: string | null;
  participantIds: string[];
}

export class UpdateExpense {
  constructor(
    private readonly expenseRepo: ExpenseRepository,
    private readonly payerRepo: PayerRepository
  ) {}

  async execute(input: UpdateExpenseInput): Promise<Expense> {
    const existing = await this.expenseRepo.findById(input.id);
    if (!existing) {
      throw new ExpenseNotFoundError(input.id);
    }

    const eventPayers = await this.payerRepo.findByEventId(input.eventId);
    const eventPayerIdMap = new Map(eventPayers.map((p, idx) => [p.id, idx]));

    for (const pId of input.participantIds) {
      if (!eventPayerIdMap.has(pId)) {
        throw new ValidationError(`O participante ${pId} não pertence a este evento.`);
      }
    }

    const sortedParticipantIds = [...input.participantIds].sort((a, b) => {
      const idxA = eventPayerIdMap.get(a) ?? 0;
      const idxB = eventPayerIdMap.get(b) ?? 0;
      return idxA - idxB;
    });

    const updated = new Expense({
      id: existing.id,
      eventId: input.eventId,
      name: input.name,
      supplier: input.supplier,
      category: input.category,
      amountCents: input.amountCents,
      notes: input.notes,
      expenseDate: input.expenseDate,
      status: input.status,
      payerId: input.payerId,
      paidAt: input.paidAt,
      participantIds: sortedParticipantIds,
      createdAt: existing.createdAt,
    });

    await this.expenseRepo.save(updated);
    return updated;
  }
}
