"use server";

import { revalidatePath } from "next/cache";
import { addPayer, updatePayer, deletePayer } from "@/main/container";
import { addPayerSchema, updatePayerSchema, deletePayerSchema } from "./schemas";
import {
  ActionResult,
  actionSuccessVoid,
  actionError,
} from "@/shared/presentation/ActionResult";
import { DomainError } from "@/shared/domain/DomainError";

export async function addPayerAction(data: unknown): Promise<ActionResult<void>> {
  try {
    const parsed = addPayerSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return actionError("Dados do pagador inválidos.", fieldErrors);
    }

    await addPayer.execute(parsed.data);

    revalidatePath(`/events/${parsed.data.eventId}`);
    return actionSuccessVoid();
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em addPayerAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}

export async function updatePayerAction(data: unknown): Promise<ActionResult<void>> {
  try {
    const parsed = updatePayerSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return actionError("Dados do pagador inválidos.", fieldErrors);
    }

    await updatePayer.execute(parsed.data);

    revalidatePath(`/events/${parsed.data.eventId}`);
    return actionSuccessVoid();
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em updatePayerAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}

export async function deletePayerAction(data: unknown): Promise<ActionResult<void>> {
  try {
    const parsed = deletePayerSchema.safeParse(data);
    if (!parsed.success) {
      return actionError("Dados de exclusão inválidos.");
    }

    await deletePayer.execute(parsed.data);

    revalidatePath(`/events/${parsed.data.eventId}`);
    return actionSuccessVoid();
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em deletePayerAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}
