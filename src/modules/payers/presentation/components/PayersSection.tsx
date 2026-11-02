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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Payer } from "../../domain/Payer";
import PayerDialog from "./PayerDialog";
import ConfirmDialog from "@/shared/presentation/ConfirmDialog";
import { deletePayerAction } from "../actions";

export interface PayersSectionProps {
  eventId: string;
  payers: Payer[];
}

export default function PayersSection({ eventId, payers }: PayersSectionProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPayer, setEditingPayer] = React.useState<Payer | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [payerToDelete, setPayerToDelete] = React.useState<Payer | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingPayer(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (payer: Payer) => {
    setEditingPayer(payer);
    setDialogOpen(true);
  };

  const handleOpenDelete = (payer: Payer) => {
    setPayerToDelete(payer);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!payerToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await deletePayerAction({
        id: payerToDelete.id,
        eventId,
      });

      if (!res.ok) {
        setSnackbarMessage(res.error.message);
      } else {
        setDeleteConfirmOpen(false);
        setPayerToDelete(null);
      }
    } catch {
      setSnackbarMessage("Erro ao excluir o pagador. Tente novamente.");
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
            Pagadores ({payers.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pessoas ou grupos responsáveis pelos pagamentos e rateio.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenNew}
          sx={{ textTransform: "none" }}
        >
          Novo pagador
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contato</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payers.map((payer) => (
              <TableRow key={payer.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{payer.name}</TableCell>
                <TableCell color="text.secondary">
                  {payer.description || "—"}
                </TableCell>
                <TableCell color="text.secondary">
                  {payer.contact || "—"}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label={`Editar pagador ${payer.name}`}
                    onClick={() => handleOpenEdit(payer)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Excluir pagador ${payer.name}`}
                    onClick={() => handleOpenDelete(payer)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PayerDialog
        open={dialogOpen}
        eventId={eventId}
        payerToEdit={editingPayer}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Excluir pagador?"
        content={
          payerToDelete
            ? `Tem certeza que deseja excluir o pagador "${payerToDelete.name}"?`
            : ""
        }
        confirmText="Excluir"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setPayerToDelete(null);
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
