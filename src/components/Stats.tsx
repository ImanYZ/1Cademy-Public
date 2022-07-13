import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useQuery } from "react-query";

import { getStats } from "@/lib/knowledgeApi";

const Stats = () => {
  const { data: stats } = useQuery("stats", getStats);

  if (!stats) {
    return <Box data-testid="empty-stats" sx={{ mt: 4, mb: 10, height: "48px" }}></Box>;
  }

  return (
    <Stack data-testid="stats" sx={{ mt: 4, mb: 10, color: "common.white" }} spacing={1}>
      <Typography textAlign="center" color="common.white">
        {`Search ${stats.nodes} nodes and ${stats.links} links through ${stats.proposals} proposals`}
      </Typography>
      <Typography
        color="common.white"
        textAlign="center"
      >{`from ${stats.users} users in ${stats.institutions} institutions`}</Typography>
    </Stack>
  );
};

export default Stats;
