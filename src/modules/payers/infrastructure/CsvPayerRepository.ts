import "server-only";
import { PayerRepository } from "../domain/PayerRepository";
import { Payer } from "../domain/Payer";
import { CsvFile } from "@/shared/infrastructure/csv/CsvFile";

interface PayerRow extends Record<string, string> {
  id: string;
  event_id: string;
  name: string;
  description: string;
  contact: string;
  created_at: string;
}

const HEADERS = ["id", "event_id", "name", "description", "contact", "created_at"];
const FILENAME = "payers.csv";

export class CsvPayerRepository implements PayerRepository {
  constructor(private readonly csv: CsvFile) {}

  private toDomain(row: PayerRow): Payer {
    return new Payer({
      id: row.id,
      eventId: row.event_id,
      name: row.name,
      description: row.description || "",
      contact: row.contact || "",
      createdAt: row.created_at,
    });
  }

  private toRow(payer: Payer): PayerRow {
    return {
      id: payer.id,
      event_id: payer.eventId,
      name: payer.name,
      description: payer.description,
      contact: payer.contact,
      created_at: payer.createdAt,
    };
  }

  async findByEventId(eventId: string): Promise<Payer[]> {
    const rows = await this.csv.read<PayerRow>(FILENAME, HEADERS);
    return rows
      .filter((r) => r.event_id === eventId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Payer | null> {
    const rows = await this.csv.read<PayerRow>(FILENAME, HEADERS);
    const found = rows.find((r) => r.id === id);
    return found ? this.toDomain(found) : null;
  }

  async save(payer: Payer): Promise<void> {
    await this.csv.modify<PayerRow>(FILENAME, HEADERS, (rows) => {
      const idx = rows.findIndex((r) => r.id === payer.id);
      const newRow = this.toRow(payer);
      if (idx >= 0) {
        rows[idx] = newRow;
      } else {
        rows.push(newRow);
      }
      return rows;
    });
  }

  async saveMany(payers: Payer[]): Promise<void> {
    if (payers.length === 0) return;
    await this.csv.modify<PayerRow>(FILENAME, HEADERS, (rows) => {
      for (const payer of payers) {
        const idx = rows.findIndex((r) => r.id === payer.id);
        const newRow = this.toRow(payer);
        if (idx >= 0) {
          rows[idx] = newRow;
        } else {
          rows.push(newRow);
        }
      }
      return rows;
    });
  }

  async delete(id: string): Promise<void> {
    await this.csv.modify<PayerRow>(FILENAME, HEADERS, (rows) => {
      return rows.filter((r) => r.id !== id);
    });
  }

  async deleteByEventId(eventId: string): Promise<void> {
    await this.csv.modify<PayerRow>(FILENAME, HEADERS, (rows) => {
      return rows.filter((r) => r.event_id !== eventId);
    });
  }
}
