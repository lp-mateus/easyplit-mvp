"use client";

import * as React from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import { Event } from "../../domain/Event";
import { eventTypeLabel, formatDate } from "@/shared/presentation/formatters";

export interface EventsListProps {
  events: Event[];
}

export default function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 2,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nenhum evento cadastrado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Crie seu primeiro evento para começar a organizar o rateio de custos.
        </Typography>
        <Button
          component={Link}
          href="/events/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: "none" }}
        >
          Novo evento
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {events.map((event) => (
        <Grid item xs={12} sm={6} md={4} key={event.id}>
          <Card
            component={Link}
            href={`/events/${event.id}`}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, gap: 1 }}>
                <Chip
                  label={eventTypeLabel(event.type)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                {event.title}
              </Typography>
              {event.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {event.description}
                </Typography>
              )}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: "auto" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(event.eventDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {event.guestCount > 0 ? `${event.guestCount} convidados` : "Sem convidados informados"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
