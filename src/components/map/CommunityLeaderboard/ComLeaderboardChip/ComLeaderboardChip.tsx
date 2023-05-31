// import "./ComLeaderboardChip.css";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Box, Tooltip, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useEffect, useState } from "react";

import { preventEventPropagation } from "@/lib/utils/eventHandlers";
import shortenNumber from "@/lib/utils/shortenNumber";

import usePrevious from "../../../../hooks/usePrevious";
import { DESIGN_SYSTEM_COLORS } from "../../../../lib/theme/colors";
type ComLeaderboardChipProps = {
  totalPositives: number;
  totalNegatives: number;
  totalPoints: number;
  idx: number;
  comTitle: string;
};

const ComLeaderboardChip = (props: ComLeaderboardChipProps) => {
  const [pointsGained, setPointsGained] = useState(false);
  const [pointsLost, setPointsLost] = useState(false);

  const prevAmount = usePrevious({
    totalPositives: props.totalPositives,
    totalNegatives: props.totalNegatives,
    totalPoints: props.totalPoints,
  });

  useEffect(() => {
    if (
      prevAmount &&
      "totalPositives" in prevAmount &&
      "totalPositives" in props &&
      "totalNegatives" in prevAmount &&
      "totalNegatives" in props &&
      "totalPoints" in prevAmount &&
      "totalPoints" in props
    ) {
      if (
        prevAmount.totalPoints < props.totalPoints ||
        prevAmount.totalPositives - prevAmount.totalNegatives < props.totalPositives - props.totalNegatives
      ) {
        setPointsGained(true);
        setTimeout(() => {
          setPointsGained(false);
        }, 1000);
      } else if (
        prevAmount.totalPoints > props.totalPoints ||
        prevAmount.totalPositives - prevAmount.totalNegatives > props.totalPositives - props.totalNegatives
      ) {
        setPointsLost(true);
        setTimeout(() => {
          setPointsLost(false);
        }, 1000);
      }
    }
  }, [props.totalPoints, props.totalPositives, props.totalNegatives]);

  return (
    <Tooltip
      placement="top"
      title={
        <Stack onClick={preventEventPropagation} alignItems="center" spacing={"2px"} sx={{ p: "6px 12px" }}>
          <Typography
            sx={{
              fontSize: "10px",
              lineHeight: "18px",
              fontWeight: 500,
              textAlign: "center",
              color: DESIGN_SYSTEM_COLORS.gray100,
            }}
          >
            {props.comTitle}
          </Typography>

          <Stack direction={"row"} spacing={"12px"}>
            <Stack direction={"row"} alignItems={"center"} spacing={"3px"}>
              <Typography sx={{ fontSize: "10px", color: DESIGN_SYSTEM_COLORS.gray100 }}>
                {shortenNumber(props.totalPositives, 2, false)}
              </Typography>
              <DoneIcon className="green-text" sx={{ fontSize: "12px" }} />
            </Stack>
            <Stack direction={"row"} alignItems={"center"} spacing={"3px"}>
              <Typography sx={{ fontSize: "10px", color: DESIGN_SYSTEM_COLORS.gray100 }}>
                {shortenNumber(props.totalNegatives, 2, false)}{" "}
              </Typography>
              <CloseIcon className="red-text" sx={{ fontSize: "12px" }} />
            </Stack>
          </Stack>
        </Stack>
      }
    >
      <Box
        className={
          "ComLeaderboardChip Tooltip" + (pointsGained ? " GainedPoint" : "") + (pointsLost ? " LostPoint" : "")
        }
        // onClick={openUserInfo}
        sx={{ width: "140px", height: "46px", p: "2px 8px" }}
      >
        <Box sx={{ width: "36px", display: "grid", placeItems: "center" }}>
          <Typography className="ComLeaderboardChipNum" sx={{ fontSize: "32px", fontFamily: "KaTeX_Main" }}>
            {props.idx + 1}
          </Typography>
        </Box>
        <Box className="ComLeaderboardChipDesc" sx={{ fontSize: "12px", fontWeight: 500, pl: "4px" }}>
          {props.comTitle}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "10px",
              fontWeight: 400,
              gap: "4px",
            }}
          >
            {/* <i className="material-icons DoneIcon green-text">done</i> */}
            <DoneIcon className="green-text" sx={{ fontSize: "12px" }} />
            {shortenNumber(props.totalPoints, 2, false)}
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
};

export const MemoizedComLeaderboardChip = React.memo(ComLeaderboardChip);
