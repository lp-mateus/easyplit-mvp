import "server-only";
import { EventRepository } from "../domain/EventRepository";
import { Event } from "../domain/Event";
import { EventType } from "../domain/EventType";
import { CsvFile } from "@/shared/infrastructure/csv/CsvFile";

interface EventRow extends Record<string, string> {
  id: string;
  title: string;
  type: string;
  description: string;
  guest_count: string;
  event_date: string;
  created_at: string;
}

const HEADERS = [
  "id",
  "title",
  "type",
  "description",
  "guest_count",
  "event_date",
  "created_at",
];

const FILENAME = "events.csv";

export class CsvEventRepository implements EventRepository {
  constructor(private readonly csv: CsvFile) {}

  private toDomain(row: EventRow): Event {
    return new Event({
      id: row.id,
      title: row.title,
      type: row.type as EventType,
      description: row.description || "",
      guestCount: parseInt(row.guest_count, 10) || 0,
      eventDate: row.event_date,
      createdAt: row.created_at,
    });
  }

  private toRow(event: Event): EventRow {
    return {
      id: event.id,
      title: event.title,
      type: event.type,
      description: event.description,
      guest_count: event.guestCount.toString(),
      event_date: event.eventDate,
      created_at: event.createdAt,
    };
  }

  async findAll(): Promise<Event[]> {
    const rows = await this.csv.read<EventRow>(FILENAME, HEADERS);
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Event | null> {
    const rows = await this.csv.read<EventRow>(FILENAME, HEADERS);
    const found = rows.find((r) => r.id === id);
    return found ? this.toDomain(found) : null;
  }

  async save(event: Event): Promise<void> {
    await this.csv.modify<EventRow>(FILENAME, HEADERS, (rows) => {
      const idx = rows.findIndex((r) => r.id === event.id);
      const newRow = this.toRow(event);
      if (idx >= 0) {
        rows[idx] = newRow;
      } else {
        rows.push(newRow);
      }
      return rows;
    });
  }

  async delete(id: string): Promise<void> {
    await this.csv.modify<EventRow>(FILENAME, HEADERS, (rows) => {
      return rows.filter((r) => r.id !== id);
    });
  }
}
