import { ValidationError } from "@/shared/domain/DomainError";

export interface PayerProps {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  contact?: string;
  createdAt: string; // ISO datetime
}

export class Payer {
  readonly id: string;
  readonly eventId: string;
  readonly name: string;
  readonly description: string;
  readonly contact: string;
  readonly createdAt: string;

  constructor(props: PayerProps) {
    const trimmedName = props.name?.trim() ?? "";
    if (!trimmedName || trimmedName.length > 80) {
      throw new ValidationError("O nome do pagador deve ter entre 1 e 80 caracteres.");
    }

    if (!props.eventId?.trim()) {
      throw new ValidationError("O ID do evento é obrigatório para o pagador.");
    }

    const trimmedDesc = props.description?.trim() ?? "";
    if (trimmedDesc.length > 300) {
      throw new ValidationError("A descrição não pode ter mais de 300 caracteres.");
    }

    const trimmedContact = props.contact?.trim() ?? "";
    if (trimmedContact.length > 120) {
      throw new ValidationError("O contato não pode ter mais de 120 caracteres.");
    }

    this.id = props.id;
    this.eventId = props.eventId.trim();
    this.name = trimmedName;
    this.description = trimmedDesc;
    this.contact = trimmedContact;
    this.createdAt = props.createdAt;
  }
}
