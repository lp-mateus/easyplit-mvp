import { ValidationError } from "@/shared/domain/DomainError";
import { EventType, EVENT_TYPES } from "./EventType";

export interface EventProps {
  id: string;
  title: string;
  type: EventType;
  description?: string;
  guestCount: number;
  eventDate: string; // YYYY-MM-DD
  createdAt: string; // ISO datetime
}

export class Event {
  readonly id: string;
  readonly title: string;
  readonly type: EventType;
  readonly description: string;
  readonly guestCount: number;
  readonly eventDate: string;
  readonly createdAt: string;

  constructor(props: EventProps) {
    const trimmedTitle = props.title?.trim() ?? "";
    if (!trimmedTitle || trimmedTitle.length > 120) {
      throw new ValidationError("O título do evento deve ter entre 1 e 120 caracteres.");
    }

    if (!EVENT_TYPES.includes(props.type)) {
      throw new ValidationError(`Tipo de evento inválido: ${props.type}`);
    }

    if (!Number.isInteger(props.guestCount) || props.guestCount < 0) {
      throw new ValidationError("O número de convidados deve ser um inteiro maior ou igual a zero.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(props.eventDate)) {
      throw new ValidationError("Data do evento inválida. Use o formato AAAA-MM-DD.");
    }

    const trimmedDesc = props.description?.trim() ?? "";
    if (trimmedDesc.length > 500) {
      throw new ValidationError("A descrição não pode ter mais de 500 caracteres.");
    }

    this.id = props.id;
    this.title = trimmedTitle;
    this.type = props.type;
    this.description = trimmedDesc;
    this.guestCount = props.guestCount;
    this.eventDate = props.eventDate;
    this.createdAt = props.createdAt;
  }
}
