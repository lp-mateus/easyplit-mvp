import { ValidationError, BusinessRuleError } from "@/shared/domain/DomainError";
import { ExpenseCategory, EXPENSE_CATEGORIES } from "./ExpenseCategory";
import { ExpenseStatus, EXPENSE_STATUSES } from "./ExpenseStatus";

export interface ExpenseProps {
  id: string;
  eventId: string;
  name: string;
  supplier?: string;
  category: ExpenseCategory;
  amountCents: number;
  notes?: string;
  expenseDate: string; // YYYY-MM-DD
  status: ExpenseStatus;
  payerId: string | null;
  paidAt: string | null; // YYYY-MM-DD
  participantIds: string[];
  createdAt: string; // ISO datetime
}

export class Expense {
  readonly id: string;
  readonly eventId: string;
  readonly name: string;
  readonly supplier: string;
  readonly category: ExpenseCategory;
  readonly amountCents: number;
  readonly notes: string;
  readonly expenseDate: string;
  readonly status: ExpenseStatus;
  readonly payerId: string | null;
  readonly paidAt: string | null;
  readonly participantIds: readonly string[];
  readonly createdAt: string;

  constructor(props: ExpenseProps) {
    const trimmedName = props.name?.trim() ?? "";
    if (!trimmedName || trimmedName.length > 120) {
      throw new ValidationError("O nome da despesa deve ter entre 1 e 120 caracteres.");
    }

    if (!props.eventId?.trim()) {
      throw new ValidationError("O ID do evento é obrigatório para a despesa.");
    }

    if (!EXPENSE_CATEGORIES.includes(props.category)) {
      throw new ValidationError(`Categoria inválida: ${props.category}`);
    }

    if (!Number.isInteger(props.amountCents) || props.amountCents <= 0) {
      throw new ValidationError("O valor da despesa deve ser um inteiro positivo em centavos.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(props.expenseDate)) {
      throw new ValidationError("Data da despesa inválida. Use o formato AAAA-MM-DD.");
    }

    if (!EXPENSE_STATUSES.includes(props.status)) {
      throw new ValidationError(`Status inválido: ${props.status}`);
    }

    const uniqueParticipants = Array.from(new Set(props.participantIds.map((p) => p.trim())));
    if (uniqueParticipants.length === 0) {
      throw new ValidationError("A despesa deve ter ao menos um participante.");
    }

    if (props.status === "PAID") {
      if (!props.payerId) {
        throw new BusinessRuleError("Despesa paga exige um pagador.");
      }
      if (!props.paidAt || !/^\d{4}-\d{2}-\d{2}$/.test(props.paidAt)) {
        throw new BusinessRuleError("Despesa paga exige data de pagamento válida (AAAA-MM-DD).");
      }
      if (!uniqueParticipants.includes(props.payerId)) {
        throw new BusinessRuleError("O pagador da despesa deve ser um dos participantes do rateio.");
      }
    } else {
      if (props.payerId !== null || props.paidAt !== null) {
        throw new BusinessRuleError("Despesa pendente não deve ter pagador nem data de pagamento.");
      }
    }

    const trimmedSupplier = props.supplier?.trim() ?? "";
    if (trimmedSupplier.length > 120) {
      throw new ValidationError("O fornecedor não pode ter mais de 120 caracteres.");
    }

    const trimmedNotes = props.notes?.trim() ?? "";
    if (trimmedNotes.length > 500) {
      throw new ValidationError("As observações não podem ter mais de 500 caracteres.");
    }

    this.id = props.id;
    this.eventId = props.eventId.trim();
    this.name = trimmedName;
    this.supplier = trimmedSupplier;
    this.category = props.category;
    this.amountCents = props.amountCents;
    this.notes = trimmedNotes;
    this.expenseDate = props.expenseDate;
    this.status = props.status;
    this.payerId = props.status === "PAID" ? props.payerId : null;
    this.paidAt = props.status === "PAID" ? props.paidAt : null;
    this.participantIds = Object.freeze(uniqueParticipants);
    this.createdAt = props.createdAt;
  }
}
