import { Expense } from "../domain/Expense";
import { ExpenseRepository } from "../domain/ExpenseRepository";
import { ExpenseCategory } from "../domain/ExpenseCategory";
import { ExpenseStatus } from "../domain/ExpenseStatus";
import { PayerRepository } from "@/modules/payers/domain/PayerRepository";
import { ValidationError } from "@/shared/domain/DomainError";
import { generateId } from "@/shared/domain/ids";

export interface CreateExpenseInput {
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

export class CreateExpense {
  constructor(
    private readonly expenseRepo: ExpenseRepository,
    private readonly payerRepo: PayerRepository
  ) {}

  async execute(input: CreateExpenseInput): Promise<Expense> {
    const eventPayers = await this.payerRepo.findByEventId(input.eventId);
    const eventPayerIdMap = new Map(eventPayers.map((p, idx) => [p.id, idx]));

    // Check all participantIds belong to event
    for (const pId of input.participantIds) {
      if (!eventPayerIdMap.has(pId)) {
        throw new ValidationError(`O participante ${pId} não pertence a este evento.`);
      }
    }

    // Sort participantIds by the order of payer creation in the event
    const sortedParticipantIds = [...input.participantIds].sort((a, b) => {
      const idxA = eventPayerIdMap.get(a) ?? 0;
      const idxB = eventPayerIdMap.get(b) ?? 0;
      return idxA - idxB;
    });

    const expense = new Expense({
      id: generateId(),
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
      createdAt: new Date().toISOString(),
    });

    await this.expenseRepo.save(expense);
    return expense;
  }
}
