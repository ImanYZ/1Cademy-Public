import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type PhotoProps = {
  src: string;
  title: string;
  subtitle: string;
};
const Photo = ({ src, title, subtitle }: PhotoProps) => {
  return (
    <Box
      sx={{
        width: "250px",
        height: "334px",
        backgroundImage: `url(${src})`,
        position: "relative",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Box
        sx={{
          height: "90px",
          position: "absolute",
          bottom: "0px",
          left: "0px",
          right: "0px",
          p: "16px 24px",
          background: "#00000080",
        }}
      >
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "white" }}>{title}</Typography>
        <Typography sx={{ fontSize: "16px", fontWeight: 400, color: "white" }}>{subtitle}</Typography>
      </Box>
    </Box>
  );
};

export default Photo;
