import { NotFoundError } from "@/shared/domain/DomainError";

export class ExpenseNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Despesa não encontrada: ${id}` : "Despesa não encontrada.");
  }
}
