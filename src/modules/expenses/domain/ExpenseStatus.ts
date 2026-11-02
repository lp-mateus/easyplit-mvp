export const EXPENSE_STATUSES = ["PENDING", "PAID"] as const;

export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];
