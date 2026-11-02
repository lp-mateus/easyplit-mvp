import { z } from "zod";

export const payerSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(80, "Máximo de 80 caracteres"),
  description: z.string().trim().max(300, "Máximo de 300 caracteres").optional().default(""),
  contact: z.string().trim().max(120, "Máximo de 120 caracteres").optional().default(""),
});

export const addPayerSchema = payerSchema.extend({
  eventId: z.string().uuid("ID do evento inválido"),
});

export const updatePayerSchema = payerSchema.extend({
  id: z.string().uuid("ID inválido"),
  eventId: z.string().uuid("ID do evento inválido"),
});

export const deletePayerSchema = z.object({
  id: z.string().uuid("ID inválido"),
  eventId: z.string().uuid("ID do evento inválido"),
});

export type PayerFormData = z.infer<typeof payerSchema>;
export type AddPayerFormData = z.infer<typeof addPayerSchema>;
export type UpdatePayerFormData = z.infer<typeof updatePayerSchema>;
export type DeletePayerFormData = z.infer<typeof deletePayerSchema>;
