import { NotFoundError } from "@/shared/domain/DomainError";

export class EventNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Evento não encontrado: ${id}` : "Evento não encontrado.");
  }
}
