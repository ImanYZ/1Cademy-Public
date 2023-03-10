import { Box, Chip, Typography } from "@mui/material";
import React from "react";

import OptimizedAvatar from "@/components/OptimizedAvatar";

type HeadlessLeaderboardChipProps = {
  name?: string;
  imageUrl: string;
  reputation: number;
  isChamp: boolean;
  renderAsAvatar?: boolean;
};

const HeadlessLeaderboardChip = ({
  name = "",
  imageUrl,
  reputation,
  isChamp,
  renderAsAvatar = true,
}: HeadlessLeaderboardChipProps) => {
  return (
    <Chip
      sx={{
        height: 60,
        borderRadius: 28,
        padding: "6px",
      }}
      icon={<OptimizedAvatar name={name} imageUrl={imageUrl} renderAsAvatar={renderAsAvatar} />}
      variant="outlined"
      label={
        <Box sx={{ my: 1 }}>
          <Typography variant="body2" component="div">
            {name}
          </Typography>
          <Typography variant="body2" component="div">
            {isChamp ? "🏆" : "✔️"}
            {" " + Math.round((reputation + Number.EPSILON) * 100) / 100}
          </Typography>
        </Box>
      }
    />
  );
};

const FocusedViewHeadlessLeaderboardChip = ({
  name = "",
  imageUrl,
  reputation,
  isChamp,
  renderAsAvatar = true,
}: HeadlessLeaderboardChipProps) => {
  return (
    <Chip
      sx={{
        height: 60,
        background: theme => (theme.palette.mode === "dark" ? "#232426" : "#D0D5DD"),
        padding: "6px",
        border: theme =>
          theme.palette.mode === "dark" ? "1px solid #404040!important" : "1px solid #D0D5DD!important",
      }}
      icon={
        <OptimizedAvatar
          sx={{
            ...(renderAsAvatar && {
              border: theme =>
                theme.palette.mode === "dark" ? "1px solid #404040!important" : "1px solid #D0D5DD!important",
            }),
          }}
          name={name}
          imageUrl={imageUrl}
          renderAsAvatar={renderAsAvatar}
        />
      }
      variant="outlined"
      label={
        <Box sx={{ my: 1 }}>
          <Typography variant="body2" component="div">
            {name}
          </Typography>
          <Typography variant="body2" component="div">
            {isChamp ? "🏆" : "✔️"}
            {" " + Math.round((reputation + Number.EPSILON) * 100) / 100}
          </Typography>
        </Box>
      }
    />
  );
};

export const MemoizedHeadlessLeaderboardChip = React.memo(HeadlessLeaderboardChip);
export const MemoizedFocusedViewHeadlessLeaderboardChip = React.memo(FocusedViewHeadlessLeaderboardChip);
