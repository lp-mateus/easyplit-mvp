"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Erro capturado por ErrorBoundary:", error);
  }, [error]);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 8, textAlign: "center" }}>
      <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
        {error.message || "Ocorreu um erro inesperado ao carregar a página."}
      </Alert>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button variant="contained" onClick={() => reset()} sx={{ textTransform: "none" }}>
          Tentar novamente
        </Button>
        <Button
          component={Link}
          href="/events"
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          Voltar para Eventos
        </Button>
      </Box>
    </Box>
  );
}
