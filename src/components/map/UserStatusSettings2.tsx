import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Box, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { User } from "src/knowledgeTypes";

import usePrevious from "../../hooks/usePrevious";
import shortenNumber from "../../lib/utils/shortenNumber";
import OptimizedAvatar from "../OptimizedAvatar";

type UserStatusSettingsProps = {
  imageUrl: string;
  online: boolean;
  onClick: () => void;
  totalPositives?: any;
  totalNegatives?: any;
  totalPoints?: any;
  smallVersion?: boolean;
  user: User;
  sx: SxProps<Theme>;
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
        // className="SidebarButton"
        onClick={onClick}
        sx={{
          // border: "dashed 2px pink",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "5px",
          cursor: "pointer",
          background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
          paddingY: "10px",
          paddingX: "5px",
          border: theme => (theme.palette.mode === "dark" ? "solid 1px #303134" : "solid 1px #D0D5DD"),
          borderRadius: "16px",
          // width: "90%",
          ...sx,
        }}
      >
        <div className={(pointsGained ? "GainedPoint" : "") + (pointsLost ? "LostPoint" : "")}>
          <OptimizedAvatar
            imageUrl={props.imageUrl}
            name={`${props.user.fName} ${props.user.lName}`}
            renderAsAvatar={true}
            contained={false}
            sx={{ border: "none", width: "48px", height: "48px", position: "static" }}
          />
        </div>
        {!smallVersion && (
          <Box className={"customUserStatusTotalPoints"}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >{`${props.user.fName} ${props.user.lName}`}</Typography>
              <Box sx={{ display: "flex", gap: "10px" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <DoneIcon className="material-icons DoneIcon green-text" sx={{ fontSize: "16px" }} />
                  <span style={{ fontSize: "14px", paddingLeft: "4px" }}>
                    {shortenNumber(props.totalPositives, 2, false)}
                  </span>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CloseIcon className="material-icons red-text" sx={{ fontSize: "16px" }} />
                  <span style={{ fontSize: "14px", paddingLeft: "4px" }}>
                    {shortenNumber(props.totalNegatives, 2, false)}
                  </span>
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
