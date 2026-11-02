import { Event } from "./Event";

export interface EventRepository {
  findAll(): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  save(event: Event): Promise<void>;
  delete(id: string): Promise<void>;
}
