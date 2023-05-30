import CloseIcon from "@mui/icons-material/Close";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneIcon from "@mui/icons-material/Done";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import { Box, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { User } from "src/knowledgeTypes";

import usePrevious from "../../hooks/usePrevious";
import { DESIGN_SYSTEM_COLORS } from "../../lib/theme/colors";
import shortenNumber from "../../lib/utils/shortenNumber";
import OptimizedAvatar2 from "../OptimizedAvatar2";
import { PointsType } from "../PointsType";

type UserStatusSettingsProps = {
  imageUrl: string;
  online: boolean;
  onClick: () => void;
  totalPositives?: any;
  totalNegatives?: any;
  totalPoints?: any;
  smallVersion?: boolean;
  user: User;
  sx?: SxProps<Theme>;
};

const UserStatusSettings = ({ onClick, smallVersion = true, sx, ...props }: UserStatusSettingsProps) => {
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
    // TODO: check dependencies to remove this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.totalPoints, props.totalPositives, props.totalNegatives]);

  const getTooltipTitle = (): JSX.Element => {
    let title: string = "Your profile settings";

    if ("totalPositives" in props && "totalNegatives" in props) {
      return (
        <>
          <span>{title}</span>
          <br></br>
          {shortenNumber(props.totalPositives, 2, false) + " "}
          <DoneIcon className="material-icons DoneIcon green-text" />
          {" ― "}
          <span>{shortenNumber(props.totalNegatives, 2, false)} </span>
          <CloseIcon className="material-icons red-text" />
        </>
      );
    }

    return <span>{title}</span>;
  };

  return (
    <Tooltip title={getTooltipTitle()} placement="right">
      <Box
        id="user-settings-button"
        onClick={onClick}
        sx={{
          minWidth: "52px",
          width: "100%",
          // height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: smallVersion ? "center" : "flex-start",
          p: smallVersion ? "6px" : "8px 6px",
          gap: "6px",
          cursor: "pointer",
          background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
          border: theme => (theme.palette.mode === "dark" ? "solid 1px #303134" : "solid 1px #D0D5DD"),
          borderRadius: "16px",
          ...sx,
        }}
      >
        <div className={(pointsGained ? "GainedPoint" : "") + (pointsLost ? "LostPoint" : "")}>
          <OptimizedAvatar2
            imageUrl={props.imageUrl}
            alt={`${props.user.fName} ${props.user.lName}`}
            size={smallVersion ? 40 : 48}
          />
        </div>
        {!smallVersion && (
          <Box className={"customUserStatusTotalPoints"}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >{`${props.user.fName} ${props.user.lName}`}</Typography>
              <Box sx={{ display: "flex", gap: "10px" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PointsType points={props.totalPositives} fontWeight={400} fontSize={"12px"}>
                    <DoneRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.success600, fontSize: "16px" }} />
                  </PointsType>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PointsType points={props.totalNegatives} fontWeight={400} fontSize={"12px"}>
                    <CloseRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange600, fontSize: "16px" }} />
                  </PointsType>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export const MemoizedUserStatusSettings = React.memo(UserStatusSettings);
