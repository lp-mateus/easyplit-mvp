"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { EventDashboardData } from "../domain/types";
import { formatCurrency } from "@/shared/presentation/formatters";

export interface DashboardCardsProps {
  data: EventDashboardData;
}

export default function DashboardCards({ data }: DashboardCardsProps) {
  const { totals, payers } = data;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visão geral dos custos e situação do compromisso financeiro de cada parte.
        </Typography>
      </Box>

      {/* Cards de Totais do Evento */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total de despesas
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                {formatCurrency(totals.totalExpensesCents)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total pago
              </Typography>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                {formatCurrency(totals.totalPaidCents)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total pendente
              </Typography>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: totals.totalPendingCents > 0 ? "warning.main" : "text.primary",
                }}
              >
                {formatCurrency(totals.totalPendingCents)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Custo por convidado
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                {totals.costPerGuestCents !== null
                  ? formatCurrency(totals.costPerGuestCents)
                  : "—"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Explicação da regra de saldo */}
      <Alert
        icon={<InfoOutlinedIcon fontSize="small" />}
        severity="info"
        variant="outlined"
        sx={{ mb: 3, py: 0.5 }}
      >
        Saldo = Já pago − Parte total. Negativo indica o quanto ainda falta pagar aos fornecedores.
      </Alert>

      {/* Cards por Pagador */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        Situação dos Pagadores
      </Typography>

      <Grid container spacing={2}>
        {payers.map((payer) => {
          let balanceColor = "text.primary";
          let chipLabel = "Quitado";
          let chipColor: "error" | "success" | "default" = "default";

          if (payer.balanceCents < 0) {
            balanceColor = "error.main";
            chipLabel = "A pagar";
            chipColor = "error";
          } else if (payer.balanceCents > 0) {
            balanceColor = "success.main";
            chipLabel = "A receber";
            chipColor = "success";
          }

          return (
            <Grid item xs={12} sm={6} md={4} key={payer.payerId}>
              <Paper variant="outlined" sx={{ p: 2.5, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {payer.name}
                  </Typography>
                  <Chip label={chipLabel} color={chipColor} size="small" variant="outlined" />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Parte total:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(payer.totalShareCents)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Já pago:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(payer.paidCents)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pt: 1,
                      borderTop: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Saldo do compromisso:
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: balanceColor }}
                    >
                      {formatCurrency(payer.balanceCents)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
