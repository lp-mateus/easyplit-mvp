"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import { EVENT_TYPES } from "../../domain/EventType";
import { eventTypeLabel } from "@/shared/presentation/formatters";

export default function EventsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentType = searchParams.get("type") ?? "";

  const [q, setQ] = React.useState(currentQ);
  const [type, setType] = React.useState(currentType);

  const applyFilters = React.useCallback(
    (newQ: string, newType: string) => {
      const params = new URLSearchParams();
      if (newQ.trim()) params.set("q", newQ.trim());
      if (newType) params.set("type", newType);
      const queryString = params.toString();
      router.push(queryString ? `/events?${queryString}` : "/events");
    },
    [router]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQ(val);
    applyFilters(val, type);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setType(val);
    applyFilters(q, val);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        mb: 4,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, flexGrow: 1, flexWrap: "wrap" }}>
        <TextField
          label="Buscar por título"
          variant="outlined"
          size="small"
          value={q}
          onChange={handleSearchChange}
          placeholder="Ex: Casamento..."
          sx={{ minWidth: 240, flexGrow: 1 }}
        />
        <TextField
          select
          label="Tipo de evento"
          variant="outlined"
          size="small"
          value={type}
          onChange={handleTypeChange}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos os tipos</MenuItem>
          {EVENT_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {eventTypeLabel(t)}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Button
        component={Link}
        href="/events/new"
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
      >
        Novo evento
      </Button>
    </Box>
  );
}
