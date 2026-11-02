import { Event } from "../domain/Event";
import { EventRepository } from "../domain/EventRepository";
import { EventType } from "../domain/EventType";
import { Payer } from "@/modules/payers/domain/Payer";
import { PayerRepository } from "@/modules/payers/domain/PayerRepository";
import { DuplicatePayerNameError } from "@/modules/payers/domain/errors";
import { ValidationError } from "@/shared/domain/DomainError";
import { generateId } from "@/shared/domain/ids";

export interface CreateEventInput {
  title: string;
  type: EventType;
  description?: string;
  guestCount: number;
  eventDate: string;
}

export interface CreatePayerInput {
  name: string;
  description?: string;
  contact?: string;
}

export interface CreateEventWithPayersInput {
  event: CreateEventInput;
  payers: CreatePayerInput[];
}

export class CreateEventWithPayers {
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly payerRepo: PayerRepository
  ) {}

  async execute(input: CreateEventWithPayersInput): Promise<{ eventId: string }> {
    if (!input.payers || input.payers.length < 2) {
      throw new ValidationError("Informe ao menos 2 pagadores.");
    }

    // Check unique names among payers (case-insensitive)
    const seenNames = new Set<string>();
    for (const p of input.payers) {
      const lower = p.name.trim().toLowerCase();
      if (seenNames.has(lower)) {
        throw new DuplicatePayerNameError(p.name.trim());
      }
      seenNames.add(lower);
    }

    const eventId = generateId();
    const now = new Date();

    const event = new Event({
      id: eventId,
      title: input.event.title,
      type: input.event.type,
      description: input.event.description,
      guestCount: input.event.guestCount,
      eventDate: input.event.eventDate,
      createdAt: now.toISOString(),
    });

    // Create payers with strictly incremented millisecond timestamps to ensure stable order
    const payers = input.payers.map((p, idx) => {
      const payerCreatedAt = new Date(now.getTime() + idx * 10).toISOString();
      return new Payer({
        id: generateId(),
        eventId,
        name: p.name,
        description: p.description,
        contact: p.contact,
        createdAt: payerCreatedAt,
      });
    });

    await this.eventRepo.save(event);
    await this.payerRepo.saveMany(payers);

    return { eventId };
  }
}
