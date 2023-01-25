import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useEffect, useState } from "react";

import { StatsSchema } from "../../../knowledgeTypes";

type MagnitudeProps = {
  stats: StatsSchema;
  width: number;
};

export const Magnitude = ({ stats, width }: MagnitudeProps) => {
  const [logoWidth, setLogoWidth] = useState(200);
  const [fontSize, setFontSize] = useState(24);

  useEffect(() => {
    let newWidth = width / 2;
    if (width >= 700) newWidth = 240;
    else if (width >= 500) newWidth = 180;
    else if (width >= 400) newWidth = 130;
    else if (width >= 0) newWidth = 100;

    setLogoWidth(newWidth);
    // const newHeight = getHeight(newWidth);
    // setCanvasDimension({ width: newWidth, height: newHeight });
  }, [width]);

  useEffect(() => {
    let newWidth = 24;
    if (width >= 700) newWidth = 24;
    else if (width >= 600) newWidth = 22;
    else if (width >= 400) newWidth = 20;
    else if (width >= 0) newWidth = 16;

    setFontSize(newWidth);
    // const newHeight = getHeight(newWidth);
    // setCanvasDimension({ width: newWidth, height: newHeight });
  }, [width]);

  return (
    <Stack direction={"column"} gap={width > 900 ? "30px" : "4px"} alignItems={"center"}>
      <Box sx={{ width: logoWidth }} className="magnitude-logo-scale">
        <img src="DarkModeLogo_o.svg" alt="" />
      </Box>

      <Typography fontSize={fontSize} className="magnitude-text-one">
        <Typography fontSize={fontSize} component={"span"} color={"primary"} fontWeight={700}>
          {stats.nodes}{" "}
        </Typography>
        nodes and{" "}
        <Typography fontSize={fontSize} component={"span"} color={"primary"} fontWeight={700}>
          {stats.links}{" "}
        </Typography>{" "}
        links have been
      </Typography>

      <Typography fontSize={fontSize} className="magnitude-text-two">
        contributed through{" "}
        <Typography fontSize={fontSize} component={"span"} color={"primary"} fontWeight={700}>
          {stats.proposals}
        </Typography>{" "}
        proposals from{" "}
      </Typography>

      <Typography fontSize={fontSize} className="magnitude-text-three">
        <Typography fontSize={fontSize} component={"span"} color={"primary"} fontWeight={700}>
          {stats.users}{" "}
        </Typography>
        users in{" "}
        <Typography fontSize={fontSize} component={"span"} color={"primary"} fontWeight={700}>
          {stats.institutions}
        </Typography>{" "}
        institutions
      </Typography>
    </Stack>
  );
};
