import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

const FocusedNodeSkeleton = () => {
  return (
    <Box sx={{ height: "calc(100vh - var(--navbar-height) - var(--footer-height) )", p: { xs: 3, md: 10 } }}>
      <Grid container spacing={3} sx={{ height: "100%" }}>
        <Grid item sm={12} md={3}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Grid>
        <Grid item sm={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%" }}>
              <Skeleton />
              <Skeleton />
              <Skeleton height="100%" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item sm={12} md={3}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FocusedNodeSkeleton;
