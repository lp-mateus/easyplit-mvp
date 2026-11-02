import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { listEvents } from "@/main/container";
import { EventType, EVENT_TYPES } from "@/modules/events/domain/EventType";
import EventsFilter from "@/modules/events/presentation/components/EventsFilter";
import EventsList from "@/modules/events/presentation/components/EventsList";

export const dynamic = "force-dynamic";

export interface EventsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const rawType = params.type?.trim();
  const type = rawType && EVENT_TYPES.includes(rawType as EventType) ? (rawType as EventType) : undefined;

  const rawEvents = await listEvents.execute({ search: q, type });
  const events = rawEvents.map((event) => ({ ...event }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Eventos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie seus eventos e acompanhe a divisão de despesas.
        </Typography>
      </Box>

      <EventsFilter />
      <EventsList events={events} />
    </Box>
  );
}
