import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

export default function EventDetailLoading() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* EventSummary Skeleton */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Skeleton variant="text" width="50%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="30%" height={24} />
      </Paper>

      {/* PayersSection Skeleton */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Skeleton variant="text" width="20%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
      </Paper>

      {/* Dashboard Skeleton */}
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
