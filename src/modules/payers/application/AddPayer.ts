import { Payer } from "../domain/Payer";
import { PayerRepository } from "../domain/PayerRepository";
import { DuplicatePayerNameError } from "../domain/errors";
import { generateId } from "@/shared/domain/ids";

export interface AddPayerInput {
  eventId: string;
  name: string;
  description?: string;
  contact?: string;
}

export class AddPayer {
  constructor(private readonly payerRepo: PayerRepository) {}

  async execute(input: AddPayerInput): Promise<Payer> {
    const existing = await this.payerRepo.findByEventId(input.eventId);
    const trimmedName = input.name.trim();

    const duplicate = existing.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      throw new DuplicatePayerNameError(trimmedName);
    }

    const payer = new Payer({
      id: generateId(),
      eventId: input.eventId,
      name: trimmedName,
      description: input.description,
      contact: input.contact,
      createdAt: new Date().toISOString(),
    });

    await this.payerRepo.save(payer);
    return payer;
  }
}
