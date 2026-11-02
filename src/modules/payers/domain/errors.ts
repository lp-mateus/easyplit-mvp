import { NotFoundError, BusinessRuleError } from "@/shared/domain/DomainError";

export class PayerNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Pagador não encontrado: ${id}` : "Pagador não encontrado.");
  }
}

export class DuplicatePayerNameError extends BusinessRuleError {
  constructor(name: string) {
    super(`Já existe um pagador com este nome neste evento: "${name}".`);
  }
}

export class MinPayersRequiredError extends BusinessRuleError {
  constructor() {
    super("Não é possível excluir o pagador: o evento deve ter no mínimo 2 pagadores.");
  }
}

export class PayerHasExpensesError extends BusinessRuleError {
  constructor() {
    super("Não é possível excluir o pagador: ele participa de despesas.");
  }
}
