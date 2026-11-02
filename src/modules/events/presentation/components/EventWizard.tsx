"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { EVENT_TYPES, EventType } from "../../domain/EventType";
import { eventTypeLabel } from "@/shared/presentation/formatters";
import { createEventWithPayersAction } from "../actions";

const steps = ["Dados do Evento", "Pagadores Participantes"];

interface PayerRowState {
  name: string;
  description: string;
  contact: string;
}

export default function EventWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  // Step 1: Event fields
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<EventType>("CASAMENTO");
  const [description, setDescription] = React.useState("");
  const [guestCount, setGuestCount] = React.useState<number | string>(0);
  const [eventDate, setEventDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [eventErrors, setEventErrors] = React.useState<Record<string, string>>({});

  // Step 2: Payers fields (min 2)
  const [payers, setPayers] = React.useState<PayerRowState[]>([
    { name: "", description: "", contact: "" },
    { name: "", description: "", contact: "" },
  ]);
  const [payerErrors, setPayerErrors] = React.useState<Record<number, string>>({});

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = "Informe o título do evento.";
    } else if (title.trim().length > 120) {
      errors.title = "O título não pode ter mais de 120 caracteres.";
    }

    if (!EVENT_TYPES.includes(type)) {
      errors.type = "Selecione um tipo válido.";
    }

    const guests = typeof guestCount === "string" ? parseInt(guestCount, 10) : guestCount;
    if (isNaN(guests) || guests < 0) {
      errors.guestCount = "O número de convidados deve ser zero ou maior.";
    }

    if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      errors.eventDate = "Informe uma data válida.";
    }

    setEventErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<number, string> = {};
    if (payers.length < 2) {
      setGlobalError("O evento deve ter no mínimo 2 pagadores.");
      return false;
    }

    const seenNames = new Set<string>();
    payers.forEach((p, idx) => {
      const trimmed = p.name.trim();
      if (!trimmed) {
        errors[idx] = "Informe o nome do pagador.";
      } else if (trimmed.length > 80) {
        errors[idx] = "Nome não pode ter mais de 80 caracteres.";
      } else {
        const lower = trimmed.toLowerCase();
        if (seenNames.has(lower)) {
          errors[idx] = "Já existe um pagador com este nome.";
        }
        seenNames.add(lower);
      }
    });

    setPayerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setGlobalError(null);
    if (activeStep === 0) {
      if (validateStep1()) {
        setActiveStep(1);
      }
    }
  };

  const handleBack = () => {
    setGlobalError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleAddPayerRow = () => {
    setPayers((prev) => [...prev, { name: "", description: "", contact: "" }]);
  };

  const handleRemovePayerRow = (index: number) => {
    if (payers.length <= 2) return;
    setPayers((prev) => prev.filter((_, i) => i !== index));
    setPayerErrors((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handlePayerChange = (
    index: number,
    field: keyof PayerRowState,
    value: string
  ) => {
    setPayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (field === "name" && payerErrors[index]) {
      setPayerErrors((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  const handleSubmit = async () => {
    setGlobalError(null);
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    try {
      const res = await createEventWithPayersAction({
        event: {
          title: title.trim(),
          type,
          description: description.trim(),
          guestCount: Number(guestCount) || 0,
          eventDate,
        },
        payers: payers.map((p) => ({
          name: p.name.trim(),
          description: p.description.trim(),
          contact: p.contact.trim(),
        })),
      });

      if (!res.ok) {
        setGlobalError(res.error.message);
        setLoading(false);
        return;
      }

      router.push(`/events/${res.data.eventId}`);
    } catch {
      setGlobalError("Ocorreu um erro ao salvar o evento. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {globalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {globalError}
        </Alert>
      )}

      {activeStep === 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informações do Evento
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                required
                fullWidth
                label="Título do evento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={Boolean(eventErrors.title)}
                helperText={eventErrors.title}
                placeholder="Ex: Casamento Tatiana & Mateus"
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
                error={Boolean(eventErrors.type)}
                helperText={eventErrors.type}
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
                error={Boolean(eventErrors.eventDate)}
                helperText={eventErrors.eventDate}
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
                error={Boolean(eventErrors.guestCount)}
                helperText={eventErrors.guestCount || "Pode ser 0 caso ainda não esteja definido"}
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
                placeholder="Detalhes ou anotações sobre o evento..."
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 1 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h6">Pagadores Participantes</Typography>
              <Typography variant="body2" color="text.secondary">
                Informe ao menos 2 pagadores que participarão da divisão dos custos.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddPayerRow}
              size="small"
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Adicionar pagador
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {payers.map((payer, idx) => (
              <Paper
                key={idx}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  position: "relative",
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      size="small"
                      label={`Pagador ${idx + 1}`}
                      placeholder="Ex: Pais da noiva"
                      value={payer.name}
                      onChange={(e) => handlePayerChange(idx, "name", e.target.value)}
                      error={Boolean(payerErrors[idx])}
                      helperText={payerErrors[idx]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Descrição (opcional)"
                      placeholder="Ex: Lado da noiva"
                      value={payer.description}
                      onChange={(e) => handlePayerChange(idx, "description", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={10} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Contato (opcional)"
                      placeholder="Telefone / e-mail"
                      value={payer.contact}
                      onChange={(e) => handlePayerChange(idx, "contact", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2} sm={1} sx={{ textAlign: "center" }}>
                    <IconButton
                      aria-label={`Remover pagador ${idx + 1}`}
                      color="error"
                      disabled={payers.length <= 2 || loading}
                      onClick={() => handleRemovePayerRow(idx)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          sx={{ textTransform: "none" }}
        >
          Voltar
        </Button>
        {activeStep === 0 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ textTransform: "none" }}
          >
            Avançar
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ textTransform: "none" }}
          >
            Concluir e Criar Evento
          </Button>
        )}
      </Box>
    </Box>
  );
}
