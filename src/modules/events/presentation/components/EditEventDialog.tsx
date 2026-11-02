"use client";

import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Event } from "../../domain/Event";
import { EVENT_TYPES, EventType } from "../../domain/EventType";
import { eventTypeLabel } from "@/shared/presentation/formatters";
import { updateEventAction } from "../actions";

export interface EditEventDialogProps {
  open: boolean;
  event: Event;
  onClose: () => void;
}

export default function EditEventDialog({
  open,
  event,
  onClose,
}: EditEventDialogProps) {
  const [title, setTitle] = React.useState(event.title);
  const [type, setType] = React.useState<EventType>(event.type);
  const [description, setDescription] = React.useState(event.description);
  const [guestCount, setGuestCount] = React.useState<number | string>(event.guestCount);
  const [eventDate, setEventDate] = React.useState(event.eventDate);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTitle(event.title);
    setType(event.type);
    setDescription(event.description);
    setGuestCount(event.guestCount);
    setEventDate(event.eventDate);
    setError(null);
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Informe o título do evento.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateEventAction({
        id: event.id,
        title: title.trim(),
        type,
        description: description.trim(),
        guestCount: Number(guestCount) || 0,
        eventDate,
      });

      if (!res.ok) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();
    } catch {
      setError("Erro ao atualizar o evento. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Editar Evento</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                required
                fullWidth
                label="Título do evento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                required
                fullWidth
                label="Tipo"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
              >
                {EVENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {eventTypeLabel(t)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Data do evento"
                InputLabelProps={{ shrink: true }}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Número de convidados"
                inputProps={{ min: 0 }}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descrição (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
