import { Box, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

import { UserInteraction, UserInteractionData } from "./LivelinessBar";

type UserBubbleProps = {
  userInteraction: UserInteractionData;
  displayEmails: boolean;
  isOnline: boolean;
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  size?: number;
};

export const UserBubble = ({
  userInteraction,
  // uname,
  displayEmails,
  isOnline,
  openUserInfoSidebar,
  size = 28,
}: UserBubbleProps) => {
  const [className, setClassName] = useState("");

  useEffect(() => {
    if (userInteraction.count < 0) return;
    if (userInteraction.reputation === "Gain") setClassName("GainedPoint");
    if (userInteraction.reputation === "Loss") setClassName("LostPoint");

    const timerId = setTimeout(() => setClassName(""), 1000);
    () => clearTimeout(timerId);
  }, [userInteraction.count, userInteraction.reputation]);

  return (
    <Tooltip
      title={
        <Box sx={{ textAlign: "center" }}>
          <Box component={"span"}>{userInteraction.chooseUname ? userInteraction.uname : userInteraction.fullname}</Box>
          {displayEmails && (
            <Box component={"p"} sx={{ my: 0 }}>
              {userInteraction.email}
            </Box>
          )}
          <Box component={"p"} sx={{ my: 0 }}>
            {userInteraction.count.toFixed(2)} Point
            {userInteraction.count > 1 ? "s" : ""}
          </Box>
        </Box>
      }
    >
      <Box
        onClick={() =>
          openUserInfoSidebar(
            userInteraction.uname,
            userInteraction.imageUrl,
            userInteraction.fullname,
            userInteraction.chooseUname ? "1" : "" // TODO: check this
          )
        }
        className={className}
        sx={{
          width: `${size}px`,
          height: `${size}px`,
          cursor: "pointer",
          // display: "inline-block",
          // position: "absolute",
          // left: "0px",
          // bottom: "0px",
          transition: "all 0.2s 0s ease",
          background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
          borderRadius: "50%",
          // transform: `translate(-50%, ${verticalPosition}px)`,
          "& > .user-image": {
            borderRadius: "50%",
            overflow: "hidden",
            width: "28px",
            height: "28px",
          },
          "&.GainedPoint": {
            "& > .user-image": {
              boxShadow: "1px 1px 13px 4px rgba(21, 255, 0, 1)",
            },
          },
          "&.LostPoint": {
            "& > .user-image": {
              boxShadow: "1px 1px 13px 4px rgba(255, 0, 0, 1)",
            },
          },
          "@keyframes slidein": {
            from: {
              transform: "translateY(0%)",
            },
            to: {
              transform: "translateY(100%)",
            },
          },
        }}
      >
        <Box className="user-image">
          <OptimizedAvatar2
            alt={userInteraction.fullname}
            imageUrl={userInteraction.imageUrl}
            size={size}
            sx={{ border: "none" }}
          />
        </Box>
        {isOnline && (
          <Box
            sx={{
              background: "#12B76A",
            }}
            className="UserStatusOnlineIcon"
          />
        )}
      </Box>
    </Tooltip>
  );
};

type GetSeekPositionInput = {
  userInteraction: UserInteraction;
  maxActions: number;
  minActions: number;
  barHeight: number;
};

export const getSeekPosition = ({
  maxActions,
  minActions,
  userInteraction,
  barHeight,
}: GetSeekPositionInput): number => {
  const maxActionsLog = Math.log(maxActions);
  const totalInteraction = userInteraction.count + Math.abs(minActions);
  const _count = Math.log(totalInteraction > 0 ? totalInteraction : 1);
  const seekPosition = -1 * ((_count / maxActionsLog) * barHeight - (_count === 0 ? 0 : 35));
  return seekPosition;
};
