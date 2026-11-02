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
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
import CircularProgress from "@mui/material/CircularProgress";
import { Expense } from "../../domain/Expense";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "../../domain/ExpenseCategory";
import { ExpenseStatus } from "../../domain/ExpenseStatus";
import { ShareCalculator } from "../../domain/ShareCalculator";
import { Payer } from "@/modules/payers/domain/Payer";
import { Money } from "@/shared/domain/Money";
import { categoryLabel, formatCurrency } from "@/shared/presentation/formatters";
import { createExpenseAction, updateExpenseAction } from "../actions";

export interface ExpenseDialogProps {
  open: boolean;
  eventId: string;
  payers: Payer[];
  expenseToEdit?: Expense | null;
  onClose: () => void;
}

export default function ExpenseDialog({
  open,
  eventId,
  payers,
  expenseToEdit,
  onClose,
}: ExpenseDialogProps) {
  const [name, setName] = React.useState("");
  const [supplier, setSupplier] = React.useState("");
  const [category, setCategory] = React.useState<ExpenseCategory>("ESPACO_LOCAL");
  const [amountInput, setAmountInput] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [expenseDate, setExpenseDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = React.useState<ExpenseStatus>("PENDING");
  const [payerId, setPayerId] = React.useState<string>("");
  const [paidAt, setPaidAt] = React.useState<string>("");
  const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<string[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setSupplier(expenseToEdit.supplier);
      setCategory(expenseToEdit.category);
      setAmountInput((expenseToEdit.amountCents / 100).toFixed(2).replace(".", ","));
      setNotes(expenseToEdit.notes);
      setExpenseDate(expenseToEdit.expenseDate);
      setStatus(expenseToEdit.status);
      setPayerId(expenseToEdit.payerId ?? "");
      setPaidAt(expenseToEdit.paidAt ?? "");
      setSelectedParticipantIds([...expenseToEdit.participantIds]);
    } else {
      setName("");
      setSupplier("");
      setCategory("ESPACO_LOCAL");
      setAmountInput("");
      setNotes("");
      const today = new Date().toISOString().split("T")[0];
      setExpenseDate(today);
      setStatus("PENDING");
      setPayerId("");
      setPaidAt("");
      // Default: all payers selected
      setSelectedParticipantIds(payers.map((p) => p.id));
    }
    setError(null);
  }, [expenseToEdit, open, payers]);

  // Calculate integer cents for preview
  const parsedCents = React.useMemo(() => {
    if (!amountInput.trim()) return 0;
    try {
      return Money.fromReais(amountInput).toCents();
    } catch {
      return 0;
    }
  }, [amountInput]);

  // Order participants by payers order
  const orderedSelectedParticipantIds = React.useMemo(() => {
    const map = new Map(payers.map((p, idx) => [p.id, idx]));
    return [...selectedParticipantIds].sort((a, b) => (map.get(a) ?? 0) - (map.get(b) ?? 0));
  }, [selectedParticipantIds, payers]);

  // Calculate share preview
  const sharesPreview = React.useMemo(() => {
    if (parsedCents <= 0 || orderedSelectedParticipantIds.length === 0) return new Map<string, number>();
    const shares = ShareCalculator.calculate(parsedCents, orderedSelectedParticipantIds);
    return new Map(shares.map((s) => [s.payerId, s.shareCents]));
  }, [parsedCents, orderedSelectedParticipantIds]);

  const handleStatusChange = (newStatus: ExpenseStatus) => {
    setStatus(newStatus);
    if (newStatus === "PENDING") {
      setPayerId("");
      setPaidAt("");
    } else {
      if (!payerId && selectedParticipantIds.length > 0) {
        setPayerId(selectedParticipantIds[0]);
      }
      if (!paidAt) {
        setPaidAt(expenseDate || new Date().toISOString().split("T")[0]);
      }
    }
  };

  const handleToggleParticipant = (id: string) => {
    let updated: string[];
    if (selectedParticipantIds.includes(id)) {
      if (selectedParticipantIds.length <= 1) {
        return; // at least 1 participant required
      }
      updated = selectedParticipantIds.filter((p) => p !== id);
      if (payerId === id && status === "PAID") {
        setPayerId(updated[0] ?? "");
      }
    } else {
      updated = [...selectedParticipantIds, id];
    }
    setSelectedParticipantIds(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let amountCents = 0;
    try {
      amountCents = Money.fromReais(amountInput).toCents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Valor inválido");
      return;
    }

    if (amountCents <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    if (selectedParticipantIds.length === 0) {
      setError("Selecione ao menos um participante.");
      return;
    }

    if (status === "PAID") {
      if (!payerId) {
        setError("Informe quem pagou a despesa.");
        return;
      }
      if (!selectedParticipantIds.includes(payerId)) {
        setError("O pagador deve participar do rateio.");
        return;
      }
      if (!paidAt) {
        setError("Informe a data do pagamento.");
        return;
      }
    }

    setLoading(true);
    try {
      if (expenseToEdit) {
        const res = await updateExpenseAction({
          id: expenseToEdit.id,
          eventId,
          name: name.trim(),
          supplier: supplier.trim(),
          category,
          amountCents,
          notes: notes.trim(),
          expenseDate,
          status,
          payerId: status === "PAID" ? payerId : null,
          paidAt: status === "PAID" ? paidAt : null,
          participantIds: orderedSelectedParticipantIds,
        });

        if (!res.ok) {
          setError(res.error.message);
          setLoading(false);
          return;
        }
      } else {
        const res = await createExpenseAction({
          eventId,
          name: name.trim(),
          supplier: supplier.trim(),
          category,
          amountCents,
          notes: notes.trim(),
          expenseDate,
          status,
          payerId: status === "PAID" ? payerId : null,
          paidAt: status === "PAID" ? paidAt : null,
          participantIds: orderedSelectedParticipantIds,
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
      setError("Erro ao salvar a despesa. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{expenseToEdit ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
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
                label="Nome da despesa"
                placeholder="Ex: Entrada do bar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Valor (R$)"
                placeholder="0,00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fornecedor (opcional)"
                placeholder="Ex: Bartender & Cia"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {categoryLabel(cat)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Data da despesa"
                InputLabelProps={{ shrink: true }}
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Status"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as ExpenseStatus)}
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="PAID">Paga</MenuItem>
              </TextField>
            </Grid>

            {status === "PAID" && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Quem pagou"
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    helperText="Restrito aos participantes do rateio"
                  >
                    {payers
                      .filter((p) => selectedParticipantIds.includes(p.id))
                      .map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="date"
                    label="Data do pagamento"
                    InputLabelProps={{ shrink: true }}
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observações (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2, mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Ratear entre:
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  Divisão igual entre os selecionados. A sobra de centavos é atribuída ao primeiro participante.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {payers.map((payer) => {
                    const isChecked = selectedParticipantIds.includes(payer.id);
                    const share = sharesPreview.get(payer.id);
                    return (
                      <Box
                        key={payer.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          py: 0.5,
                          px: 1,
                          borderRadius: 1,
                          bgcolor: isChecked ? "action.hover" : "transparent",
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleToggleParticipant(payer.id)}
                              size="small"
                            />
                          }
                          label={payer.name}
                        />
                        {isChecked && share !== undefined && (
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                            {formatCurrency(share)}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                {selectedParticipantIds.length === 0 && (
                  <FormHelperText error>Selecione ao menos um participante</FormHelperText>
                )}
              </Box>
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
            {expenseToEdit ? "Salvar Alterações" : "Adicionar Despesa"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
