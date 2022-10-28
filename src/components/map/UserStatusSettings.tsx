import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Box, SxProps, Theme, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { User } from "src/knowledgeTypes";

import usePrevious from "../../hooks/usePrevious";
// import { preventEventPropagation } from "../../lib/utils/eventHandlers";
import shortenNumber from "../../lib/utils/shortenNumber";
import OptimizedAvatar from "../OptimizedAvatar";
// import RoundImage from "./RoundImage";

type UserStatusSettingsProps = {
  imageUrl: string;
  online: boolean;
  totalPositives?: any;
  totalNegatives?: any;
  totalPoints?: any;
  onClick: () => void;
  user: User;
  sx?: SxProps<Theme>;
};

const UserStatusSettings = (props: UserStatusSettingsProps) => {
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
          {/* {tag ? " ― " + tag.title : ""} */}
          <br></br>
          {shortenNumber(props.totalPositives, 2, false) + " "}
          {/* <i className="material-icons DoneIcon green-text">done</i> */}
          <DoneIcon className="material-icons DoneIcon green-text" />
          {" ― "}
          {/* <i className="material-icons gray-text">remove</i>{" "} */}
          <span>{shortenNumber(props.totalNegatives, 2, false)} </span>
          <CloseIcon className="material-icons red-text" />
          {/* <i className="material-icons red-text">close</i> */}
        </>
      );
    }

    return <span>{title}</span>;
  };

  // this is with changes in styles
  return (
    <Tooltip title={getTooltipTitle()} placement="right">
      <Box
        // className={"SidebarButton" + (props.inUserBar ? " inUserBar" : "")}
        className="SidebarButton"
        onClick={props.onClick}
        sx={{
          // border: "dashed 2px pink",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "5px",
          padding: "5px 0px",
          ...props.sx,
        }}
      >
        <div className={(pointsGained ? "GainedPoint" : "") + (pointsLost ? "LostPoint" : "")}>
          <OptimizedAvatar
            imageUrl={props.imageUrl}
            renderAsAvatar={true}
            contained={false}
            sx={{ border: "none", width: "28px", height: "28px", position: "static", cursor: "pointer" }}
          />
          <div className={props.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></div>
        </div>
        {
          // className={"UserStatusTotalPoints" + (props.inUserBar ? " inUserBar" : "")}
          <div className={"customUserStatusTotalPoints"}>
            <DoneIcon className="material-icons DoneIcon green-text" sx={{ fontSize: "16px" }} />
            <span style={{ fontSize: "14px", paddingLeft: "4px" }}>{shortenNumber(props.totalPoints, 2, false)}</span>
            {/* {props.user.tag && <div id="UserProfileButtonDefaultTag">{props.user.tag}</div>} */}
          </div>
        }
      </Box>
    </Tooltip>
  );
};

export const MemoizedUserStatusSettings = React.memo(UserStatusSettings);
