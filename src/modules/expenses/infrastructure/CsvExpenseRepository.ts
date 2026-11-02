import "server-only";
import { ExpenseRepository } from "../domain/ExpenseRepository";
import { Expense } from "../domain/Expense";
import { ExpenseCategory } from "../domain/ExpenseCategory";
import { ExpenseStatus } from "../domain/ExpenseStatus";
import { CsvFile } from "@/shared/infrastructure/csv/CsvFile";

interface ExpenseRow extends Record<string, string> {
  id: string;
  event_id: string;
  name: string;
  supplier: string;
  category: string;
  amount_cents: string;
  notes: string;
  expense_date: string;
  status: string;
  payer_id: string;
  paid_at: string;
  created_at: string;
}

interface ParticipantRow extends Record<string, string> {
  expense_id: string;
  payer_id: string;
  position: string;
}

const EXPENSE_HEADERS = [
  "id",
  "event_id",
  "name",
  "supplier",
  "category",
  "amount_cents",
  "notes",
  "expense_date",
  "status",
  "payer_id",
  "paid_at",
  "created_at",
];

const PARTICIPANT_HEADERS = ["expense_id", "payer_id", "position"];

const EXPENSES_FILENAME = "expenses.csv";
const PARTICIPANTS_FILENAME = "expense_participants.csv";

export class CsvExpenseRepository implements ExpenseRepository {
  constructor(private readonly csv: CsvFile) {}

  private toDomain(row: ExpenseRow, participantIds: string[]): Expense {
    return new Expense({
      id: row.id,
      eventId: row.event_id,
      name: row.name,
      supplier: row.supplier || "",
      category: row.category as ExpenseCategory,
      amountCents: parseInt(row.amount_cents, 10) || 0,
      notes: row.notes || "",
      expenseDate: row.expense_date,
      status: row.status as ExpenseStatus,
      payerId: row.payer_id ? row.payer_id : null,
      paidAt: row.paid_at ? row.paid_at : null,
      participantIds,
      createdAt: row.created_at,
    });
  }

  private toRow(expense: Expense): ExpenseRow {
    return {
      id: expense.id,
      event_id: expense.eventId,
      name: expense.name,
      supplier: expense.supplier,
      category: expense.category,
      amount_cents: expense.amountCents.toString(),
      notes: expense.notes,
      expense_date: expense.expenseDate,
      status: expense.status,
      payer_id: expense.payerId ?? "",
      paid_at: expense.paidAt ?? "",
      created_at: expense.createdAt,
    };
  }

  async findByEventId(eventId: string): Promise<Expense[]> {
    const expenseRows = await this.csv.read<ExpenseRow>(EXPENSES_FILENAME, EXPENSE_HEADERS);
    const participantRows = await this.csv.read<ParticipantRow>(
      PARTICIPANTS_FILENAME,
      PARTICIPANT_HEADERS
    );

    const eventExpenses = expenseRows.filter((e) => e.event_id === eventId);

    // Group participants by expense_id, ordered by position
    const participantsByExpense = new Map<string, Array<{ payerId: string; pos: number }>>();
    for (const p of participantRows) {
      const list = participantsByExpense.get(p.expense_id) ?? [];
      list.push({ payerId: p.payer_id, pos: parseInt(p.position, 10) || 0 });
      participantsByExpense.set(p.expense_id, list);
    }

    return eventExpenses
      .sort((a, b) => {
        const dateCmp = b.expense_date.localeCompare(a.expense_date);
        if (dateCmp !== 0) return dateCmp;
        return b.created_at.localeCompare(a.created_at);
      })
      .map((row) => {
        const parts = participantsByExpense.get(row.id) ?? [];
        parts.sort((a, b) => a.pos - b.pos);
        return this.toDomain(
          row,
          parts.map((p) => p.payerId)
        );
      });
  }

  async findById(id: string): Promise<Expense | null> {
    const expenseRows = await this.csv.read<ExpenseRow>(EXPENSES_FILENAME, EXPENSE_HEADERS);
    const found = expenseRows.find((r) => r.id === id);
    if (!found) return null;

    const participantRows = await this.csv.read<ParticipantRow>(
      PARTICIPANTS_FILENAME,
      PARTICIPANT_HEADERS
    );
    const parts = participantRows
      .filter((p) => p.expense_id === id)
      .sort((a, b) => (parseInt(a.position, 10) || 0) - (parseInt(b.position, 10) || 0))
      .map((p) => p.payer_id);

    return this.toDomain(found, parts);
  }

  async existsWithParticipant(payerId: string): Promise<boolean> {
    const participantRows = await this.csv.read<ParticipantRow>(
      PARTICIPANTS_FILENAME,
      PARTICIPANT_HEADERS
    );
    return participantRows.some((p) => p.payer_id === payerId);
  }

  async save(expense: Expense): Promise<void> {
    // Save expense row
    await this.csv.modify<ExpenseRow>(EXPENSES_FILENAME, EXPENSE_HEADERS, (rows) => {
      const idx = rows.findIndex((r) => r.id === expense.id);
      const newRow = this.toRow(expense);
      if (idx >= 0) {
        rows[idx] = newRow;
      } else {
        rows.push(newRow);
      }
      return rows;
    });

    // Save participants rows (replace for this expense)
    await this.csv.modify<ParticipantRow>(
      PARTICIPANTS_FILENAME,
      PARTICIPANT_HEADERS,
      (rows) => {
        const filtered = rows.filter((r) => r.expense_id !== expense.id);
        const newParticipants: ParticipantRow[] = expense.participantIds.map((payerId, idx) => ({
          expense_id: expense.id,
          payer_id: payerId,
          position: idx.toString(),
        }));
        return [...filtered, ...newParticipants];
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.csv.modify<ParticipantRow>(
      PARTICIPANTS_FILENAME,
      PARTICIPANT_HEADERS,
      (rows) => rows.filter((r) => r.expense_id !== id)
    );

    await this.csv.modify<ExpenseRow>(
      EXPENSES_FILENAME,
      EXPENSE_HEADERS,
      (rows) => rows.filter((r) => r.id !== id)
    );
  }

  async deleteByEventId(eventId: string): Promise<void> {
    const expenseRows = await this.csv.read<ExpenseRow>(EXPENSES_FILENAME, EXPENSE_HEADERS);
    const eventExpenseIds = new Set(
      expenseRows.filter((r) => r.event_id === eventId).map((r) => r.id)
    );

    if (eventExpenseIds.size === 0) return;

    await this.csv.modify<ParticipantRow>(
      PARTICIPANTS_FILENAME,
      PARTICIPANT_HEADERS,
      (rows) => rows.filter((r) => !eventExpenseIds.has(r.expense_id))
    );

    await this.csv.modify<ExpenseRow>(
      EXPENSES_FILENAME,
      EXPENSE_HEADERS,
      (rows) => rows.filter((r) => r.event_id !== eventId)
    );
  }
}
