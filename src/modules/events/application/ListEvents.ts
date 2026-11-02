import { Event } from "../domain/Event";
import { EventRepository } from "../domain/EventRepository";
import { EventType } from "../domain/EventType";

export interface ListEventsQuery {
  search?: string;
  type?: EventType;
}

export class ListEvents {
  constructor(private readonly eventRepo: EventRepository) {}

  async execute(query: ListEventsQuery = {}): Promise<Event[]> {
    const all = await this.eventRepo.findAll();
    let filtered = all;

    if (query.search?.trim()) {
      const s = query.search.trim().toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(s));
    }

    if (query.type) {
      filtered = filtered.filter((e) => e.type === query.type);
    }

    return filtered.sort((a, b) => {
      const dateCmp = b.eventDate.localeCompare(a.eventDate);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }
}
