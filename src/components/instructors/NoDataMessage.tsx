import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type NoDataMessageProps = {
  message?: string;
};

export const NoDataMessage = ({ message }: NoDataMessageProps) => {
  return (
    <Box
      sx={{
        m: "0 auto",
        height: "calc(100vh - 200px)",
        display: "grid",
        placeItems: "center",
        overflowX: "hidden",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontSize: "36px",
          fontWeight: "400",
          color: theme => (theme.palette.mode === "light" ? "rgba(67, 68, 69,.125)" : "rgba(224, 224, 224,.125)"),
        }}
      >
        {message}
        {!message && (
          <>
            There is no data yet <br></br> to show
          </>
        )}
      </Typography>
    </Box>
  );
};
