"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDialog from "@/shared/presentation/ConfirmDialog";
import { deleteEventAction } from "../actions";

export interface DeleteEventButtonProps {
  eventId: string;
  eventTitle: string;
}

export default function DeleteEventButton({
  eventId,
  eventTitle,
}: DeleteEventButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await deleteEventAction(eventId);
      if (res.ok) {
        setOpen(false);
        router.push("/events");
      } else {
        alert(res.error.message);
        setLoading(false);
      }
    } catch {
      alert("Erro ao excluir o evento. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => setOpen(true)}
        sx={{ textTransform: "none" }}
      >
        Excluir evento
      </Button>
      <ConfirmDialog
        open={open}
        title="Excluir evento?"
        content={`Tem certeza que deseja excluir o evento "${eventTitle}"? Esta ação removerá permanentemente todos os pagadores, despesas e rateios associados (exclusão em cascata).`}
        confirmText="Excluir evento"
        confirmColor="error"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
