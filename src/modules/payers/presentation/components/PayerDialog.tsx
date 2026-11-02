"use client";

import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Payer } from "../../domain/Payer";
import { addPayerAction, updatePayerAction } from "../actions";

export interface PayerDialogProps {
  open: boolean;
  eventId: string;
  payerToEdit?: Payer | null;
  onClose: () => void;
}

export default function PayerDialog({
  open,
  eventId,
  payerToEdit,
  onClose,
}: PayerDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [contact, setContact] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (payerToEdit) {
      setName(payerToEdit.name);
      setDescription(payerToEdit.description);
      setContact(payerToEdit.contact);
    } else {
      setName("");
      setDescription("");
      setContact("");
    }
    setError(null);
  }, [payerToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Informe o nome do pagador.");
      return;
    }

    setLoading(true);
    try {
      if (payerToEdit) {
        const res = await updatePayerAction({
          id: payerToEdit.id,
          eventId,
          name: trimmedName,
          description: description.trim(),
          contact: contact.trim(),
        });
        if (!res.ok) {
          setError(res.error.message);
          setLoading(false);
          return;
        }
      } else {
        const res = await addPayerAction({
          eventId,
          name: trimmedName,
          description: description.trim(),
          contact: contact.trim(),
        });
        if (!res.ok) {
          setError(res.error.message);
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      onClose();
    } catch {
      setError("Erro ao salvar o pagador. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{payerToEdit ? "Editar Pagador" : "Novo Pagador"}</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nome"
                placeholder="Ex: Pais da noiva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição (opcional)"
                placeholder="Ex: Família Silva"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contato (opcional)"
                placeholder="Telefone / e-mail"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
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
