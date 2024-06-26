import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Box, IconButton, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { DispatchNodeBookActions } from "src/nodeBookTypes";

import { OpenLeftSidebar } from "@/pages/notebook";

import { useAuth } from "../../context/AuthContext";
import usePrevious from "../../hooks/usePrevious";
import shortenNumber from "../../lib/utils/shortenNumber";
import OptimizedAvatar from "../OptimizedAvatar";

type UserStatusIconProps = {
  id?: string;
  nodeBookDispatch: React.Dispatch<DispatchNodeBookActions>;
  uname: string;
  imageUrl: string;
  fullname: string;
  chooseUname: any;
  online: boolean;
  reloadPermanentGrpah: any;
  totalPositives?: any;
  totalNegatives?: any;
  totalPoints?: any;
  tagTitle?: string;
  setOpenSideBar: (sidebar: OpenLeftSidebar) => void;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  smallVersion?: boolean;
  user?: any;
};

const UserStatusIcon = ({ nodeBookDispatch, smallVersion = true, ...props }: UserStatusIconProps) => {
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
    nodeBookDispatch({ type: "setSelectionType", payload: "UserInfo" });
    props.setOpenSideBar("USER_INFO");
    props.reloadPermanentGrpah();
    addDoc(userUserInfoCollection, {
      uname: user.uname,
      uInfo: props.uname,
      createdAt: Timestamp.fromDate(new Date()),
    });
  }, [db, nodeBookDispatch, props, user]);

  const getTooltipTitle = (): JSX.Element => {
    let title: string = "";
    title += props.chooseUname ? props.uname : props.fullname;

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
        className="SidebarButton" // INFO: this is required to the shadows
        onClick={openUserInfo}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-center",
          gap: "10px",
          padding: "5px 0px",
          ...props.sx,
        }}
      >
        <Box
          className={(pointsGained ? "GainedPoint" : "") + (pointsLost ? "LostPoint" : "")}
          sx={{ position: "relative" }}
        >
          <OptimizedAvatar
            imageUrl={props.imageUrl}
            name={props.fullname}
            renderAsAvatar={true}
            contained={false}
            sx={{ border: "none", width: "38px", height: "38px", position: "static", cursor: "pointer" }}
          />

          {props.online && (
            <Box
              sx={{
                fontSize: "1px",
              }}
              className="UserStatusOnlineIcon"
            />
          )}
        </Box>
        {!smallVersion && (
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
                width: "95%",
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
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    fontSize: "14px",
                    width: "47px",
                    paddingLeft: "4px",
                  }}
                >
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
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    fontSize: "14px",
                    width: "47px",
                    paddingLeft: "4px",
                  }}
                >
                  {shortenNumber(props.totalNegatives, 2, false)}
                </span>
                {/* {props.user.tag && <div id="UserProfileButtonDefaultTag">{props.user.tag}</div>} */}
              </Box>
            </Box>
          </Box>
        )}
        {!smallVersion && (
          <IconButton
            sx={{
              position: "absolute",
              right: "0px",
              top: "20px",
              ":hover": {
                background: "transparent",
                boxShadow: "none!important",
              },
            }}
            size="small"
            onClick={e => {
              e.stopPropagation();
              props.setOpenSideBar("CHAT");
              setTimeout(() => {
                const openChatEvent = new CustomEvent("open-chat", {
                  detail: { user: props.user },
                });
                window.dispatchEvent(openChatEvent);
              }, 500);
            }}
          >
            <ChatBubbleOutlineOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        )}
      </Box>
    </Tooltip>
  );
};

export const MemoizedUserStatusIcon = React.memo(UserStatusIcon);
