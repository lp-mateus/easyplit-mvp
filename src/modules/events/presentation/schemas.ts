import { z } from "zod";

export const eventTypeEnum = z.enum([
  "CASAMENTO",
  "ANIVERSARIO",
  "FORMATURA",
  "CORPORATIVO",
  "CONFRATERNIZACAO",
  "OUTRO",
]);

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Informe o título").max(120, "Máximo de 120 caracteres"),
  type: eventTypeEnum,
  description: z.string().trim().max(500, "Máximo de 500 caracteres").optional().default(""),
  guestCount: z.coerce.number().int("Número de convidados deve ser inteiro").min(0, "Número inválido"),
  eventDate: isoDate,
});

export const updateEventSchema = eventSchema.extend({
  id: z.string().uuid("ID inválido"),
});

export const payerInputSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(80, "Máximo de 80 caracteres"),
  description: z.string().trim().max(300, "Máximo de 300 caracteres").optional().default(""),
  contact: z.string().trim().max(120, "Máximo de 120 caracteres").optional().default(""),
});

export const createEventWithPayersSchema = z.object({
  event: eventSchema,
  payers: z.array(payerInputSchema).min(2, "Informe ao menos 2 pagadores"),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
export type CreateEventWithPayersFormData = z.infer<typeof createEventWithPayersSchema>;
