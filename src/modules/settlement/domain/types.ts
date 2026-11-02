export interface PayerSettlement {
  payerId: string;
  name: string;
  totalShareCents: number;
  paidCents: number;
  balanceCents: number;
}

export interface EventTotals {
  totalExpensesCents: number;
  totalPaidCents: number;
  totalPendingCents: number;
  costPerGuestCents: number | null; // null se guestCount === 0
}

export interface EventDashboardData {
  totals: EventTotals;
  payers: PayerSettlement[];
}
