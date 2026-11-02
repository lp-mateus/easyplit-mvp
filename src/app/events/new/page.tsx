import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import EventWizard from "@/modules/events/presentation/components/EventWizard";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Novo Evento
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Cadastre as informações básicas e os pagadores do rateio.
        </Typography>
      </Box>

      <EventWizard />
    </Box>
  );
}
