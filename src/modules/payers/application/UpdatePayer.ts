import { Payer } from "../domain/Payer";
import { PayerRepository } from "../domain/PayerRepository";
import { PayerNotFoundError, DuplicatePayerNameError } from "../domain/errors";

export interface UpdatePayerInput {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  contact?: string;
}

export class UpdatePayer {
  constructor(private readonly payerRepo: PayerRepository) {}

  async execute(input: UpdatePayerInput): Promise<Payer> {
    const payer = await this.payerRepo.findById(input.id);
    if (!payer) {
      throw new PayerNotFoundError(input.id);
    }

    const existing = await this.payerRepo.findByEventId(input.eventId);
    const trimmedName = input.name.trim();

    const duplicate = existing.some(
      (p) => p.id !== input.id && p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      throw new DuplicatePayerNameError(trimmedName);
    }

    const updated = new Payer({
      id: payer.id,
      eventId: payer.eventId,
      name: trimmedName,
      description: input.description,
      contact: input.contact,
      createdAt: payer.createdAt,
    });

    await this.payerRepo.save(updated);
    return updated;
  }
}
