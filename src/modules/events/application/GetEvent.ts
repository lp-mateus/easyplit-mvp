import { Event } from "../domain/Event";
import { EventRepository } from "../domain/EventRepository";
import { EventNotFoundError } from "../domain/errors";

export class GetEvent {
  constructor(private readonly eventRepo: EventRepository) {}

  async execute(id: string): Promise<Event> {
    const event = await this.eventRepo.findById(id);
    if (!event) {
      throw new EventNotFoundError(id);
    }
    return event;
  }
}
