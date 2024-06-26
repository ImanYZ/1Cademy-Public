import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Box, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { DispatchNodeBookActions } from "src/nodeBookTypes";

import { OpenLeftSidebar } from "@/pages/notebook";

import { useAuth } from "../../context/AuthContext";
import usePrevious from "../../hooks/usePrevious";
// import { preventEventPropagation } from "../../lib/utils/eventHandlers";
import shortenNumber from "../../lib/utils/shortenNumber";
import OptimizedAvatar from "../OptimizedAvatar";
// import RoundImage from "./RoundImage";

type UserStatusIconProps = {
  id?: string;
  nodeBookDispatch: React.Dispatch<DispatchNodeBookActions>;
  uname: string;
  imageUrl: string;
  fullname: string;
  chooseUname: any;
  online: boolean;
  inUserBar: boolean;
  inNodeFooter: boolean;
  reloadPermanentGraph: any;
  totalPositives?: any;
  totalNegatives?: any;
  totalPoints?: any;
  tagTitle?: string;
  setOpenSideBar: (sidebar: OpenLeftSidebar) => void;
  sx?: SxProps<Theme>;
  disabled?: boolean;
};

const UserStatusIcon = ({ nodeBookDispatch, disabled = false, ...props }: UserStatusIconProps) => {
  const db = getFirestore();
  const [{ user }] = useAuth();
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

  const openUserInfo = useCallback(() => {
    if (!user) return;

    const userUserInfoCollection = collection(db, "userUserInfoLog");

    nodeBookDispatch({
      type: "setSelectedUser",
      payload: {
        username: props.uname,
        imageUrl: props.imageUrl,
        fullName: props.fullname,
        chooseUname: props.chooseUname,
      },
    });
    nodeBookDispatch({
      type: "setSelectionType",
      payload: "UserInfo",
    });
    // setSelectionType("UserInfo");
    props.setOpenSideBar("USER_INFO");
    props.reloadPermanentGraph();
    addDoc(userUserInfoCollection, {
      uname: user.uname,
      uInfo: props.uname,
      createdAt: Timestamp.fromDate(new Date()),
    });
  }, [db, nodeBookDispatch, props, user]);

  const getTooltipTitle = (): JSX.Element => {
    let title: string = "";
    title += props.inUserBar ? "Your profile settings" : props.chooseUname ? props.uname : props.fullname;

    if (!("inNodeFooter" in props && props.inNodeFooter) && "totalPositives" in props && "totalNegatives" in props) {
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
  if (disabled)
    return (
      <Box
        id={props.id}
        className={"SidebarButton" + (props.inUserBar ? " inUserBar" : "")}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-center",
          gap: "10px",
          padding: "5px 0px",
          ...props.sx,
        }}
      >
        <div>
          <OptimizedAvatar
            imageUrl={props.imageUrl}
            renderAsAvatar={true}
            name={`${user?.fName} ${user?.lName}`}
            contained={false}
            sx={{
              border: "none",
              width: "28px",
              height: "28px",
              position: "static",
              filter: "grayscale(1)",
            }}
          />
          {<div className={props.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></div>}
        </div>
        {!props.inNodeFooter && (
          <Box className="customUserStatusTotalPoints fromSideBar">
            <DoneIcon className="material-icons DoneIcon gray-text" sx={{ fontSize: "16px" }} />
            <span style={{ fontSize: "14px", paddingLeft: "4px" }}>{shortenNumber(props.totalPoints, 2, false)}</span>
            {props.inUserBar && props.tagTitle && <div id="UserProfileButtonDefaultTag">{props.tagTitle}</div>}
          </Box>
        )}
      </Box>
    );

  return (
    <Tooltip title={getTooltipTitle()} placement="right">
      <Box
        id={props.id}
        className={"SidebarButton" + (props.inUserBar ? " inUserBar" : "")}
        // className="SidebarButton"
        onClick={openUserInfo}
        sx={{
          // border: "dashed 2px pink",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-center",
          gap: "10px",
          padding: "5px 0px",
          // width: "100%",
          ...props.sx,
        }}
      >
        <div className={(pointsGained ? "GainedPoint" : "") + (pointsLost ? "LostPoint" : "")}>
          <OptimizedAvatar
            imageUrl={props.imageUrl}
            renderAsAvatar={true}
            contained={false}
            name={props.fullname}
            sx={{ border: "none", width: "38px", height: "38px", position: "static", cursor: "pointer" }}
          />
          <Box className={props.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></Box>
        </div>
        {!props.inNodeFooter && (
          // className={"UserStatusTotalPoints" + (props.inUserBar ? " inUserBar" : "")}
          <Box
            className="customUserTotalPoints fromSideBar"
            sx={{
              flexDirection: "column",
            }}
          >
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
                fontSize: "13px",
              }}
            >
              {props.fullname}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: "10px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DoneIcon className=" DoneIcon green-text" sx={{ fontSize: "14px" }} />
                <span style={{ fontSize: "14px", paddingLeft: "4px" }}>
                  {shortenNumber(props.totalPositives, 2, false)}
                </span>
                {/* {props.user.tag && <div id="UserProfileButtonDefaultTag">{props.user.tag}</div>} */}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CloseIcon className="material-icons red-text" sx={{ fontSize: "14px" }} />
                <span style={{ fontSize: "14px", paddingLeft: "4px" }}>
                  {shortenNumber(props.totalNegatives, 2, false)}
                </span>
                {/* {props.user.tag && <div id="UserProfileButtonDefaultTag">{props.user.tag}</div>} */}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export const MemoizedUserStatusIcon = React.memo(UserStatusIcon);
