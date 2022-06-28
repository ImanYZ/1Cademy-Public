import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import React, { FC } from "react";

import OptimizedAvatar from "./OptimizedAvatar";

type Props = {
  name?: string;
  imageUrl?: string;
  reputation: number;
  isChamp: boolean;
  renderAsAvatar?: boolean;
  href: string;
};

const LeaderboardChip: FC<Props> = ({ href, name = "", imageUrl, reputation, isChamp, renderAsAvatar = true }) => {
  return (
    <NextLink passHref href={href}>
      <Chip
        component="a"
        sx={{
          height: 60,
          borderRadius: 28,
          padding: "6px"
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
    </NextLink>
  );
};

export default LeaderboardChip;
