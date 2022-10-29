// import "./ComLeaderboardChip.css";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";

import { preventEventPropagation } from "@/lib/utils/eventHandlers";
import shortenNumber from "@/lib/utils/shortenNumber";

import usePrevious from "../../../../hooks/usePrevious";
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
        <Box
          onClick={preventEventPropagation}
          sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
        >
          {props.comTitle}

          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {shortenNumber(props.totalPositives, 2, false) + " "}
            {/* <i className="material-icons DoneIcon green-text">done</i> <i className="material-icons gray-text">remove</i>{" "} */}
            <DoneIcon className="green-text" />
            <RemoveIcon className="gray-text" /> <span>{shortenNumber(props.totalNegatives, 2, false)} </span>
            {/* <i className="material-icons red-text">close</i> */}
            <CloseIcon className="red-text" />
          </Box>
        </Box>
      }
    >
      <div
        className={
          "ComLeaderboardChip Tooltip" + (pointsGained ? " GainedPoint" : "") + (pointsLost ? " LostPoint" : "")
        }
        // onClick={openUserInfo}
      >
        <div className="ComLeaderboardChipNum">{props.idx + 1}</div>
        <div className="ComLeaderboardChipDesc">
          {props.comTitle}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              gap: "4px",
            }}
          >
            {/* <i className="material-icons DoneIcon green-text">done</i> */}
            <DoneIcon className="green-text" />
            {shortenNumber(props.totalPoints, 2, false)}
          </Box>
        </div>
      </div>
    </Tooltip>
  );
};

export const MemoizedComLeaderboardChip = React.memo(ComLeaderboardChip);
