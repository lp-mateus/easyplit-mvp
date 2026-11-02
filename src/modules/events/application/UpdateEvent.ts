import { Event } from "../domain/Event";
import { EventRepository } from "../domain/EventRepository";
import { EventType } from "../domain/EventType";
import { EventNotFoundError } from "../domain/errors";

export interface UpdateEventInput {
  id: string;
  title: string;
  type: EventType;
  description?: string;
  guestCount: number;
  eventDate: string;
}

export class UpdateEvent {
  constructor(private readonly eventRepo: EventRepository) {}

  async execute(input: UpdateEventInput): Promise<Event> {
    const existing = await this.eventRepo.findById(input.id);
    if (!existing) {
      throw new EventNotFoundError(input.id);
    }

    const updated = new Event({
      id: existing.id,
      title: input.title,
      type: input.type,
      description: input.description,
      guestCount: input.guestCount,
      eventDate: input.eventDate,
      createdAt: existing.createdAt,
    });

    await this.eventRepo.save(updated);
    return updated;
  }
}
