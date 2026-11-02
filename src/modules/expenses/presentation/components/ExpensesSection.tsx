"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Expense } from "../../domain/Expense";
import { Payer } from "@/modules/payers/domain/Payer";
import { categoryLabel, formatCurrency, formatDate } from "@/shared/presentation/formatters";
import ExpenseDialog from "./ExpenseDialog";
import ConfirmDialog from "@/shared/presentation/ConfirmDialog";
import { deleteExpenseAction } from "../actions";

export interface ExpensesSectionProps {
  eventId: string;
  expenses: Expense[];
  payers: Payer[];
}

export default function ExpensesSection({
  eventId,
  expenses,
  payers,
}: ExpensesSectionProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [expenseToDelete, setExpenseToDelete] = React.useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(null);

  const payerMap = React.useMemo(() => {
    return new Map(payers.map((p) => [p.id, p.name]));
  }, [payers]);

  const handleOpenNew = () => {
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleOpenDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await deleteExpenseAction({
        id: expenseToDelete.id,
        eventId,
      });

      if (!res.ok) {
        setSnackbarMessage(res.error.message);
      } else {
        setDeleteConfirmOpen(false);
        setExpenseToDelete(null);
      }
    } catch {
      setSnackbarMessage("Erro ao excluir a despesa. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Despesas ({expenses.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lançamentos de fornecedores e custos a serem rateados.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenNew}
          sx={{ textTransform: "none" }}
        >
          Nova despesa
        </Button>
      </Box>

      {expenses.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
          <Typography variant="body2">Nenhuma despesa lançada neste evento.</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fornecedor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pagador</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => {
                const payerName = expense.payerId ? payerMap.get(expense.payerId) ?? "—" : "—";
                return (
                  <TableRow key={expense.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{expense.name}</TableCell>
                    <TableCell color="text.secondary">{expense.supplier || "—"}</TableCell>
                    <TableCell>{categoryLabel(expense.category)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(expense.amountCents)}</TableCell>
                    <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                    <TableCell>
                      {expense.status === "PAID" ? (
                        <Chip label="Paga" color="success" size="small" variant="filled" />
                      ) : (
                        <Chip label="Pendente" color="warning" size="small" variant="filled" />
                      )}
                    </TableCell>
                    <TableCell>{payerName}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label={`Editar despesa ${expense.name}`}
                        onClick={() => handleOpenEdit(expense)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Excluir despesa ${expense.name}`}
                        onClick={() => handleOpenDelete(expense)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ExpenseDialog
        open={dialogOpen}
        eventId={eventId}
        payers={payers}
        expenseToEdit={editingExpense}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Excluir despesa?"
        content={
          expenseToDelete
            ? `Tem certeza que deseja excluir a despesa "${expenseToDelete.name}" (${formatCurrency(
                expenseToDelete.amountCents
              )})?`
            : ""
        }
        confirmText="Excluir"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setExpenseToDelete(null);
        }}
      />

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
