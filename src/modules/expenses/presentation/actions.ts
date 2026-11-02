"use server";

import { revalidatePath } from "next/cache";
import { createExpense, updateExpense, deleteExpense } from "@/main/container";
import {
  createExpenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
} from "./schemas";
import {
  ActionResult,
  actionSuccessVoid,
  actionError,
} from "@/shared/presentation/ActionResult";
import { DomainError } from "@/shared/domain/DomainError";

export async function createExpenseAction(data: unknown): Promise<ActionResult<void>> {
  try {
    const parsed = createExpenseSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        parsed.error.errors[0]?.message ?? "Dados da despesa inválidos.";
      return actionError(firstErrorMessage, fieldErrors);
    }

    await createExpense.execute(parsed.data);

    revalidatePath(`/events/${parsed.data.eventId}`);
    return actionSuccessVoid();
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em createExpenseAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}

export async function updateExpenseAction(data: unknown): Promise<ActionResult<void>> {
  try {
    const parsed = updateExpenseSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        parsed.error.errors[0]?.message ?? "Dados da despesa inválidos.";
      return actionError(firstErrorMessage, fieldErrors);
    }

    await updateExpense.execute(parsed.data);

    revalidatePath(`/events/${parsed.data.eventId}`);
    return actionSuccessVoid();
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em updateExpenseAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}

export async function deleteExpenseAction(data: unknown): Promise<ActionResult<void>> {
  try {
    const parsed = deleteExpenseSchema.safeParse(data);
    if (!parsed.success) {
      return actionError("Dados de exclusão inválidos.");
    }

    await deleteExpense.execute(parsed.data.id);

    revalidatePath(`/events/${parsed.data.eventId}`);
    return actionSuccessVoid();
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em deleteExpenseAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}
