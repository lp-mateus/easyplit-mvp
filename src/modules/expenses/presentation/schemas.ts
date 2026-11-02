import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../domain/ExpenseCategory";
import { EXPENSE_STATUSES } from "../domain/ExpenseStatus";

export const categoryEnum = z.enum(EXPENSE_CATEGORIES);
export const statusEnum = z.enum(EXPENSE_STATUSES);
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");

export const baseExpenseSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome").max(120, "Máximo de 120 caracteres"),
    supplier: z.string().trim().max(120, "Máximo de 120 caracteres").optional().default(""),
    category: categoryEnum,
    amountCents: z.number().int("Valor deve ser em centavos").positive("Informe um valor maior que zero"),
    notes: z.string().trim().max(500, "Máximo de 500 caracteres").optional().default(""),
    expenseDate: isoDate,
    status: statusEnum,
    payerId: z.string().uuid("ID do pagador inválido").nullable(),
    paidAt: isoDate.nullable(),
    participantIds: z
      .array(z.string().uuid("ID de participante inválido"))
      .min(1, "Selecione ao menos um participante"),
  })
  .superRefine((v, ctx) => {
    if (v.status === "PAID") {
      if (!v.payerId) {
        ctx.addIssue({
          code: "custom",
          path: ["payerId"],
          message: "Informe quem pagou",
        });
      }
      if (!v.paidAt) {
        ctx.addIssue({
          code: "custom",
          path: ["paidAt"],
          message: "Informe a data do pagamento",
        });
      }
      if (v.payerId && !v.participantIds.includes(v.payerId)) {
        ctx.addIssue({
          code: "custom",
          path: ["payerId"],
          message: "O pagador deve participar do rateio",
        });
      }
    } else {
      if (v.payerId !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["payerId"],
          message: "Despesa pendente não deve ter pagador",
        });
      }
      if (v.paidAt !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["paidAt"],
          message: "Despesa pendente não deve ter data de pagamento",
        });
      }
    }
  });

export const createExpenseSchema = baseExpenseSchema.and(
  z.object({
    eventId: z.string().uuid("ID do evento inválido"),
  })
);

export const updateExpenseSchema = baseExpenseSchema.and(
  z.object({
    id: z.string().uuid("ID inválido"),
    eventId: z.string().uuid("ID do evento inválido"),
  })
);

export const deleteExpenseSchema = z.object({
  id: z.string().uuid("ID inválido"),
  eventId: z.string().uuid("ID do evento inválido"),
});

export type BaseExpenseFormData = z.infer<typeof baseExpenseSchema>;
export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseFormData = z.infer<typeof updateExpenseSchema>;
export type DeleteExpenseFormData = z.infer<typeof deleteExpenseSchema>;
