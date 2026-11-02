import type { Metadata } from "next";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import ThemeRegistry from "@/shared/presentation/ThemeRegistry";

export const metadata: Metadata = {
  title: "EasySplit - Rateio de Custos de Eventos",
  description: "Divisão de custos e compromissos de eventos de forma simples e transparente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppBar position="static">
              <Container maxWidth="lg">
                <Toolbar disableGutters>
                  <Typography
                    variant="h6"
                    component={Link}
                    href="/events"
                    sx={{
                      mr: 4,
                      fontWeight: 700,
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    EasySplit
                  </Typography>
                  <Button
                    component={Link}
                    href="/events"
                    color="inherit"
                    sx={{ textTransform: "none", fontSize: "1rem" }}
                  >
                    Eventos
                  </Button>
                </Toolbar>
              </Container>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
              <Container maxWidth="lg">{children}</Container>
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
