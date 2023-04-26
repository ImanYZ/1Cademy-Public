import CheckIcon from "@mui/icons-material/Check";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "../../lib/theme/colors";
import { NO_USER_IMAGE } from "../../lib/utils/constants";
import { PointsType } from "../PointsType";

const MAX_DAILY_VALUE = 24;
const DAYS_LABEL = ["M", "T", "W", "T", "F", "S", "S"];

export const UserStatus = () => {
  const [daysValue, setDaysValue] = useState([0, 14, 18, 17, 7, 9, 14]);
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ width: "100%", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LeaderboardIcon sx={{ color: DESIGN_SYSTEM_COLORS.yellow400, mr: "12px" }} />
        <Typography sx={{ fontSize: "18px", fontWeight: 500 }}>Your Status</Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          //   height: "64px",
          p: "16px 20px 24px 20px",
          display: "flex",
          alignItems: "center",
          borderBottom: `solid 1px ${DESIGN_SYSTEM_COLORS.notebookG600}`,
        }}
      >
        <Box
          sx={{
            width: "56px",
            height: "56px",
            borderRadius: "30px",
            color: theme => theme.palette.common.gray,
            mr: "20px",
          }}
        >
          <Image
            src={NO_USER_IMAGE}
            alt={"user-image"}
            width="56px"
            height="56px"
            quality={40}
            objectFit="cover"
            style={{ borderRadius: "30px" }}
          />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 500, fontSize: "20px", mb: "6px" }}>Carl Johnson</Typography>
          <Stack direction={"row"} spacing="12px">
            <PointsType points={999} fontWeight={400}>
              <CheckIcon sx={{ color: DESIGN_SYSTEM_COLORS.success600, fontSize: "16px" }} />
            </PointsType>
            <PointsType points={999} fontWeight={400}>
              <PlayArrowIcon
                sx={{ color: DESIGN_SYSTEM_COLORS.success600, fontSize: "16px", transform: "rotate(-90deg)" }}
              />
            </PointsType>
          </Stack>
        </Box>
      </Box>

      {/* body */}
      <Box>
        <Box sx={{ p: "24px 20px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "18px" }}>Daily Progress</Typography>
          <Stack direction={"row"} alignItems="center" spacing={"18px"}>
            <IconButton
              onClick={() => setDaysValue([1, 12, 8, 7, 17, 4, 8])}
              sx={{ p: "2px", color: DESIGN_SYSTEM_COLORS.primary800 }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Typography>July 12 -18</Typography>
            <IconButton
              onClick={() => setDaysValue([5, 1, 16, 2, 1, 3, 2])}
              sx={{ p: "2px", color: DESIGN_SYSTEM_COLORS.primary800 }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Stack>
        </Box>
        <Box sx={{ p: "8px 20px 24px 20px", display: "flex", justifyContent: "space-between" }}>
          <Stack spacing={"20px"} sx={{ width: "51px", borderRight: `solid 1px ${DESIGN_SYSTEM_COLORS.notebookG600}` }}>
            {daysValue.map((cur, idx) => (
              <Box
                key={idx}
                sx={{
                  width: "35px",
                  height: "35px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  border: `solid 2px ${DESIGN_SYSTEM_COLORS.success500}`,
                }}
              >
                {DAYS_LABEL[idx % DAYS_LABEL.length]}
              </Box>
            ))}
          </Stack>
          <Stack spacing={"20px"} alignItems={"center"} sx={{ width: "247px" }}>
            {daysValue.map((cur, idx) => (
              <Box key={idx} sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    height: "35px",
                    width: `${(cur * 100) / MAX_DAILY_VALUE}%`,
                    backgroundColor: DESIGN_SYSTEM_COLORS.success500,
                    mr: "12px",
                  }}
                />
                <Typography sx={{ fontWeight: 500 }}>{cur}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
