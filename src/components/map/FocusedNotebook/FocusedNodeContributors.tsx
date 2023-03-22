import { Box, Grid, Typography } from "@mui/material";
import React from "react";

import { MemoizedFocusedViewHeadlessLeaderboardChip } from "./HeadlessLeaderboardChip";

const FocusedNodeContributors = ({ contributors, institutions }: any) => {
  return (
    <Box
      sx={{
        paddingY: "10px",
        borderTop: theme =>
          theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.white}` : "solid 1px #CFCFCF",
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: "15px" }}>
        Contributors are:
      </Typography>
      <Grid container spacing={1} sx={{ mt: 0 }}>
        {contributors.map((el: any, idx: number) => (
          <Grid item key={idx}>
            <MemoizedFocusedViewHeadlessLeaderboardChip
              key={idx}
              name={el.chooseUname ? el.username : el.fullname}
              imageUrl={el.imageUrl}
              reputation={el.reputation || 0}
              isChamp={idx === 0}
            />
          </Grid>
        ))}
      </Grid>
      <Typography variant="body2" color="text.secondary" sx={{ mt: "20px", mb: "15px" }}>
        Who are from:
      </Typography>
      <Grid container spacing={1} sx={{ mt: 0 }}>
        {institutions.map((el: any, idx: number) => (
          <Grid item key={idx}>
            <MemoizedFocusedViewHeadlessLeaderboardChip
              key={idx}
              name={el.name}
              imageUrl={el.logoURL}
              reputation={el.reputation || 0}
              isChamp={idx === 0}
              renderAsAvatar={false}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const MemoizedFocusedNodeContributors = React.memo(FocusedNodeContributors);
