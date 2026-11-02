import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import {
  getEvent,
  listPayersByEvent,
  listExpensesByEvent,
  getEventDashboard,
} from "@/main/container";
import EventSummary from "@/modules/events/presentation/components/EventSummary";
import PayersSection from "@/modules/payers/presentation/components/PayersSection";
import DashboardCards from "@/modules/settlement/presentation/DashboardCards";
import ExpensesSection from "@/modules/expenses/presentation/components/ExpensesSection";
import { EventNotFoundError } from "@/modules/events/domain/errors";

export const dynamic = "force-dynamic";

export interface EventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;

  let event;
  try {
    event = await getEvent.execute(eventId);
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      notFound();
    }
    throw error;
  }

  const [payers, expenses, dashboardData] = await Promise.all([
    listPayersByEvent.execute(eventId),
    listExpensesByEvent.execute(eventId),
    getEventDashboard.execute(eventId),
  ]);

  return (
    <Box>
      <EventSummary event={{ ...event }} />
      <PayersSection eventId={eventId} payers={payers.map((p) => ({ ...p }))} />
      <DashboardCards data={dashboardData} />
      <ExpensesSection
        eventId={eventId}
        expenses={expenses.map((e) => ({ ...e }))}
        payers={payers.map((p) => ({ ...p }))}
      />
    </Box>
  );
}
