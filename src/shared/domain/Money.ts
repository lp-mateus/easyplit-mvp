import { ValidationError } from "./DomainError";

export class Money {
  private readonly cents: number;

  private constructor(cents: number) {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new ValidationError(
        `Valor monetário inválido em centavos: ${cents}. Deve ser um número inteiro maior ou igual a zero.`
      );
    }
    this.cents = cents;
  }

  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  static fromReais(value: string | number): Money {
    if (typeof value === "number") {
      if (isNaN(value) || value < 0) {
        throw new ValidationError("Valor monetário em reais inválido.");
      }
      return new Money(Math.round(value * 100));
    }

    if (typeof value !== "string") {
      throw new ValidationError("Valor deve ser texto ou número.");
    }

    const trimmed = value.trim().replace(/^R\$\s*/i, "").trim();
    if (!trimmed) {
      return new Money(0);
    }

    let normalized: string;
    if (trimmed.includes(",")) {
      // Formato pt-BR: 1.234,56 ou 500,00
      normalized = trimmed.replace(/\./g, "").replace(",", ".");
    } else {
      // Formato com ponto ou número inteiro
      normalized = trimmed;
    }

    const parsed = Number(normalized);
    if (isNaN(parsed) || parsed < 0) {
      throw new ValidationError(`Valor monetário em reais inválido: "${value}".`);
    }

    return new Money(Math.round(parsed * 100));
  }

  toCents(): number {
    return this.cents;
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    if (this.cents < other.cents) {
      throw new ValidationError("O valor subtraído não pode ser maior que o valor original.");
    }
    return new Money(this.cents - other.cents);
  }

  format(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.cents / 100);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }
}
