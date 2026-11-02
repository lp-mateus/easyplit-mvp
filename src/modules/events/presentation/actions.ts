"use server";

import { revalidatePath } from "next/cache";
import { createEventWithPayers, updateEvent, deleteEvent } from "@/main/container";
import {
  createEventWithPayersSchema,
  updateEventSchema,
} from "./schemas";
import {
  ActionResult,
  actionSuccess,
  actionSuccessVoid,
  actionError,
} from "@/shared/presentation/ActionResult";
import { DomainError } from "@/shared/domain/DomainError";

export async function createEventWithPayersAction(
  data: unknown
): Promise<ActionResult<{ eventId: string }>> {
  try {
    const parsed = createEventWithPayersSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return actionError("Dados do evento ou pagadores inválidos.", fieldErrors);
    }

    const result = await createEventWithPayers.execute({
      event: parsed.data.event,
      payers: parsed.data.payers,
    });

    revalidatePath("/events");
    return actionSuccess(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em createEventWithPayersAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}

export async function updateEventAction(
  data: unknown
): Promise<ActionResult<void>> {
  try {
    const parsed = updateEventSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return actionError("Dados do evento inválidos.", fieldErrors);
    }

    await updateEvent.execute(parsed.data);

    revalidatePath("/events");
    revalidatePath(`/events/${parsed.data.id}`);
    return actionSuccessVoid();
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em updateEventAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}

export async function deleteEventAction(
  eventId: string
): Promise<ActionResult<void>> {
  try {
    if (!eventId || typeof eventId !== "string") {
      return actionError("ID do evento inválido.");
    }

    await deleteEvent.execute(eventId);

    revalidatePath("/events");
    return actionSuccessVoid();
  } catch (error) {
    if (error instanceof DomainError) {
      return actionError(error.message);
    }
    console.error("Erro inesperado em deleteEventAction:", error);
    return actionError("Erro inesperado. Tente novamente.");
  }
}
