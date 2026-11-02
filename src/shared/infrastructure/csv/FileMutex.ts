import "server-only";

export class FileMutex {
  private locks: Map<string, Promise<unknown>> = new Map();

  async runExclusive<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const previousPromise = this.locks.get(key) ?? Promise.resolve();

    let resolveCurrent!: () => void;
    const currentPromise = new Promise<void>((resolve) => {
      resolveCurrent = resolve;
    });

    this.locks.set(key, currentPromise);

    try {
      await previousPromise;
      return await fn();
    } finally {
      resolveCurrent();
      if (this.locks.get(key) === currentPromise) {
        this.locks.delete(key);
      }
    }
  }
}
