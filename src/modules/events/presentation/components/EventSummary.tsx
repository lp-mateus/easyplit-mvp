"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import { Event } from "../../domain/Event";
import { eventTypeLabel, formatDate } from "@/shared/presentation/formatters";
import EditEventDialog from "./EditEventDialog";
import DeleteEventButton from "./DeleteEventButton";

export interface EventSummaryProps {
  event: Event;
}

export default function EventSummary({ event }: EventSummaryProps) {
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {event.title}
            </Typography>
            <Chip
              label={eventTypeLabel(event.type)}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          {event.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {event.description}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Data: <strong>{formatDate(event.eventDate)}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Convidados:{" "}
                <strong>
                  {event.guestCount > 0 ? `${event.guestCount} pessoas` : "Não informado"}
                </strong>
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
            sx={{ textTransform: "none" }}
          >
            Editar
          </Button>
          <DeleteEventButton eventId={event.id} eventTitle={event.title} />
        </Box>
      </Box>

      <EditEventDialog
        open={editOpen}
        event={event}
        onClose={() => setEditOpen(false)}
      />
    </Paper>
  );
}
