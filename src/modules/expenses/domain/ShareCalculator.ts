import { ValidationError } from "@/shared/domain/DomainError";

export interface ParticipantShare {
  payerId: string;
  shareCents: number;
}

export class ShareCalculator {
  /**
   * Calcula a divisão igualitária da despesa entre os participantes.
   * A sobra de centavos (resto) vai inteira para o primeiro participante.
   * A soma das cotas é sempre exatamente igual a amountCents.
   */
  static calculate(amountCents: number, participantIds: readonly string[]): ParticipantShare[] {
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new ValidationError("O valor da despesa deve ser um inteiro positivo em centavos.");
    }

    if (!participantIds || participantIds.length === 0) {
      throw new ValidationError("A despesa deve ter ao menos um participante.");
    }

    const n = participantIds.length;
    const base = Math.floor(amountCents / n);
    const resto = amountCents - base * n;

    return participantIds.map((payerId, index) => {
      // O primeiro participante recebe o resto
      const shareCents = index === 0 ? base + resto : base;
      return {
        payerId,
        shareCents,
      };
    });
  }
}
