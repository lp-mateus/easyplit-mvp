import { Payer } from "../domain/Payer";
import { PayerRepository } from "../domain/PayerRepository";

export class ListPayersByEvent {
  constructor(private readonly payerRepo: PayerRepository) {}

  async execute(eventId: string): Promise<Payer[]> {
    return this.payerRepo.findByEventId(eventId);
  }
}
