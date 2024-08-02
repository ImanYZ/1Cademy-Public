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
  openUserInfo?: any;
  readonly?: boolean;
};

const LeaderboardChip: FC<Props> = ({
  href,
  name = "",
  imageUrl,
  reputation,
  isChamp,
  renderAsAvatar = true,
  openUserInfo,
  readonly,
}) => {
  const renderChipComponent = () => (
    <Chip
      component="a"
      sx={{
        height: 60,
        borderRadius: "8px",
        background: theme => (theme.palette.mode === "dark" ? "#242425" : "#EAECF0"),
        padding: "6px",
        border: theme =>
          theme.palette.mode === "dark" ? "1px solid #2F2F2F!important" : "1px solid #D0D5DD!important",
        ":hover": {
          background: "rgba(255, 255, 255, 0.08)",
        },
      }}
      icon={<OptimizedAvatar name={name} imageUrl={imageUrl} renderAsAvatar={renderAsAvatar} />}
      variant="outlined"
      label={
        <Box sx={{ my: 1 }}>
          <Typography
            variant="body2"
            component="div"
            sx={{
              fontSize: "15px",
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{
              fontSize: "15px",
            }}
          >
            {isChamp ? "🏆" : "✔️"}
            {" " + Math.round((reputation + Number.EPSILON) * 100) / 100}
          </Typography>
        </Box>
      }
    />
  );

  if (openUserInfo) {
    return <Box onClick={openUserInfo}>{renderChipComponent()}</Box>;
  }
  return (
    <>
      {readonly ? (
        <Box>{renderChipComponent()}</Box>
      ) : (
        <NextLink passHref href={href}>
          {renderChipComponent()}
        </NextLink>
      )}
    </>
  );
};

export default LeaderboardChip;
