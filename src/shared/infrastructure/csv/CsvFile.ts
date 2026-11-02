import "server-only";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { FileMutex } from "./FileMutex";

export class CsvFile {
  private readonly dataDir: string;
  private readonly mutex: FileMutex;

  constructor(dataDir?: string, mutex?: FileMutex) {
    this.dataDir = path.resolve(process.cwd(), dataDir ?? process.env.DATA_DIR ?? "./data");
    this.mutex = mutex ?? new FileMutex();
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getFilePath(filename: string): string {
    return path.join(this.dataDir, filename);
  }

  async ensureFile(filename: string, headers: string[]): Promise<void> {
    const filePath = this.getFilePath(filename);
    await this.mutex.runExclusive(filePath, async () => {
      this.ensureDir();
      if (!fs.existsSync(filePath)) {
        const headerContent = stringify([], { header: true, columns: headers });
        const tmpPath = `${filePath}.${crypto.randomUUID()}.tmp`;
        await fs.promises.writeFile(tmpPath, headerContent, "utf8");
        await fs.promises.rename(tmpPath, filePath);
      }
    });
  }

  async read<T = Record<string, string>>(filename: string, headers: string[]): Promise<T[]> {
    const filePath = this.getFilePath(filename);
    return await this.mutex.runExclusive(filePath, async () => {
      this.ensureDir();
      if (!fs.existsSync(filePath)) {
        const headerContent = stringify([], { header: true, columns: headers });
        const tmpPath = `${filePath}.${crypto.randomUUID()}.tmp`;
        await fs.promises.writeFile(tmpPath, headerContent, "utf8");
        await fs.promises.rename(tmpPath, filePath);
        return [];
      }

      const content = await fs.promises.readFile(filePath, "utf8");
      if (!content.trim()) {
        return [];
      }

      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
      }) as T[];

      return records;
    });
  }

  async write<T extends Record<string, unknown>>(
    filename: string,
    headers: string[],
    records: T[]
  ): Promise<void> {
    const filePath = this.getFilePath(filename);
    await this.mutex.runExclusive(filePath, async () => {
      this.ensureDir();
      const output = stringify(records, {
        header: true,
        columns: headers,
      });

      const tmpPath = `${filePath}.${crypto.randomUUID()}.tmp`;
      try {
        await fs.promises.writeFile(tmpPath, output, "utf8");
        await fs.promises.rename(tmpPath, filePath);
      } catch (err) {
        if (fs.existsSync(tmpPath)) {
          await fs.promises.unlink(tmpPath).catch(() => {});
        }
        throw err;
      }
    });
  }

  async modify<T extends Record<string, unknown>>(
    filename: string,
    headers: string[],
    modifier: (current: T[]) => Promise<T[]> | T[]
  ): Promise<T[]> {
    const filePath = this.getFilePath(filename);
    return await this.mutex.runExclusive(filePath, async () => {
      this.ensureDir();
      let records: T[] = [];
      if (fs.existsSync(filePath)) {
        const content = await fs.promises.readFile(filePath, "utf8");
        if (content.trim()) {
          records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true,
          }) as T[];
        }
      }

      const updated = await modifier(records);
      const output = stringify(updated, {
        header: true,
        columns: headers,
      });

      const tmpPath = `${filePath}.${crypto.randomUUID()}.tmp`;
      try {
        await fs.promises.writeFile(tmpPath, output, "utf8");
        await fs.promises.rename(tmpPath, filePath);
      } catch (err) {
        if (fs.existsSync(tmpPath)) {
          await fs.promises.unlink(tmpPath).catch(() => {});
        }
        throw err;
      }

      return updated;
    });
  }
}
