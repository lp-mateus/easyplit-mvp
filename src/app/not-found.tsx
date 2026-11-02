import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import Paper from "@mui/material/Paper";

export default function NotFound() {
  return (
    <Box sx={{ maxWidth: 500, mx: "auto", py: 8, textAlign: "center" }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h6" gutterBottom>
          Página ou evento não encontrado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          O evento que você está procurando não existe ou foi excluído.
        </Typography>
        <Button
          component={Link}
          href="/events"
          variant="contained"
          sx={{ textTransform: "none" }}
        >
          Voltar para a lista de eventos
        </Button>
      </Paper>
    </Box>
  );
}
