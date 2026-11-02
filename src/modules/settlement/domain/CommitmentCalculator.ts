import { PayerSettlement, EventTotals, EventDashboardData } from "./types";
import { ShareCalculator } from "@/modules/expenses/domain/ShareCalculator";
import { Expense } from "@/modules/expenses/domain/Expense";
import { Payer } from "@/modules/payers/domain/Payer";

export interface CalculateCommitmentInput {
  guestCount: number;
  payers: Payer[];
  expenses: Expense[];
}

export class CommitmentCalculator {
  static calculate(input: CalculateCommitmentInput): EventDashboardData {
    const { guestCount, payers, expenses } = input;

    let totalExpensesCents = 0;
    let totalPaidCents = 0;
    let totalPendingCents = 0;

    const paidByPayer = new Map<string, number>();
    const shareByPayer = new Map<string, number>();

    // Inicializa mapas para todos os pagadores
    for (const p of payers) {
      paidByPayer.set(p.id, 0);
      shareByPayer.set(p.id, 0);
    }

    // Processa cada despesa
    for (const expense of expenses) {
      totalExpensesCents += expense.amountCents;

      if (expense.status === "PAID") {
        totalPaidCents += expense.amountCents;
        if (expense.payerId) {
          const currentPaid = paidByPayer.get(expense.payerId) ?? 0;
          paidByPayer.set(expense.payerId, currentPaid + expense.amountCents);
        }
      } else {
        totalPendingCents += expense.amountCents;
      }

      // Calcula as cotas da despesa
      const shares = ShareCalculator.calculate(expense.amountCents, expense.participantIds);
      for (const share of shares) {
        const currentShare = shareByPayer.get(share.payerId) ?? 0;
        shareByPayer.set(share.payerId, currentShare + share.shareCents);
      }
    }

    // Calcula custo por convidado
    const costPerGuestCents =
      guestCount > 0 ? Math.round(totalExpensesCents / guestCount) : null;

    // Constrói settlements por pagador preservando a ordem de criação dos pagadores
    const payerSettlements: PayerSettlement[] = payers.map((payer) => {
      const totalShareCents = shareByPayer.get(payer.id) ?? 0;
      const paidCents = paidByPayer.get(payer.id) ?? 0;
      const balanceCents = paidCents - totalShareCents;

      return {
        payerId: payer.id,
        name: payer.name,
        totalShareCents,
        paidCents,
        balanceCents,
      };
    });

    // Invariante de verificação central: soma dos saldos de todos os pagadores = -Total pendente
    const sumBalances = payerSettlements.reduce((sum, p) => sum + p.balanceCents, 0);
    if (sumBalances !== -totalPendingCents) {
      console.warn(
        `Invariante de saldo violada: soma dos saldos (${sumBalances}) != -totalPending (${-totalPendingCents})`
      );
    }

    const totals: EventTotals = {
      totalExpensesCents,
      totalPaidCents,
      totalPendingCents,
      costPerGuestCents,
    };

    return {
      totals,
      payers: payerSettlements,
    };
  }
}
