import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { ActionsTracksChange, getActionTrackSnapshot } from "src/client/firestore/actionTracks.firestore";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { MemoizedActionBubble } from "./ActionBubble";
import {
  AbsoluteLivelinessTypes,
  calculateVerticalPositionWithLogarithm,
  SYNCHRONIZE_ABSOLUTE,
  UserInteractionDataProcessed,
  UserInteractions,
} from "./liveliness.utils";
import { UserBubble } from "./UserBubble";

type ILivelinessBarProps = {
  variant: AbsoluteLivelinessTypes;
  onlineUsers: string[];
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  onToggleDisplay: () => void;
  open: boolean;
  authEmail?: string;
};

export const PAST_24H = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
const USER_BUBBLE_SIZE = 28;

const LivelinessBar = ({ variant, onToggleDisplay, open, ...props }: ILivelinessBarProps) => {
  const db = getFirestore();
  const { onlineUsers, openUserInfoSidebar, authEmail } = props;
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [barHeight, setBarHeight] = useState<number>(0);
  const barRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onSynchronize = (changes: ActionsTracksChange[]) => {
      setUsersInteractions(prev => changes.reduce(SYNCHRONIZE_ABSOLUTE[variant].fn, { ...prev }));
    };
    const killSnapshot = getActionTrackSnapshot(db, { rewindDate: PAST_24H }, onSynchronize);
    return () => killSnapshot();
  }, [db, variant]);

  useEffect(() => {
    const handleResize = () => {
      if (!barRef.current) return;
      setBarHeight(barRef.current.clientHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const usersInteractionsArray: UserInteractionDataProcessed[] = useMemo(() => {
    const data = Object.keys(usersInteractions).map(key => ({ ...usersInteractions[key], uname: key }));
    return calculateVerticalPositionWithLogarithm({ data, height: barHeight });
  }, [barHeight, usersInteractions]);

  return (
    <Box
      id={SYNCHRONIZE_ABSOLUTE[variant].id}
      role="feed"
      aria-label={`${SYNCHRONIZE_ABSOLUTE[variant].name}`}
      sx={{
        top: "100px",
        bottom: "100px",
        right: "0px",
        p: `${USER_BUBBLE_SIZE / 2 + 20}px 10px`,
        zIndex: 998,
        position: "absolute",
        width: "56px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.darkBackground : theme.palette.common.lightBackground,
        borderRadius: "10px 0px 0px 10px",
        transform: !open ? "translate(calc(100%), 0px)" : null,
        transition: "all 0.2s 0s ease",
      }}
    >
      {/* bubble users bar */}
      <Box className="seekbar" sx={{ height: "100%", position: "relative" }}>
        <Stack
          id="liveliness-seekbar"
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{
            width: "100%",
            height: "100%",
          }}
        >
          <Box ref={barRef} sx={{ width: "100%", height: "100%", transition: "0.2s", position: "relative" }}>
            <KeyboardArrowDownIcon
              sx={{
                fontSize: "20px",
                position: "absolute",
                left: "50%",
                top: `-${USER_BUBBLE_SIZE / 2 + 16}px`,
                transform: "translateX(-50%)",
                color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
              }}
            />
            {/* background line */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: `-${USER_BUBBLE_SIZE / 2 + 8}px`,
                borderLeft: theme =>
                  theme.palette.mode === "dark" ? "2px solid #bebebe" : "1px solid rgba(0, 0, 0, 0.6)",
                bottom: `-${USER_BUBBLE_SIZE / 2 + 8}px`,
                transform: "translateX(-1px)",
              }}
            />

            {usersInteractionsArray.map((cur, idx) =>
              cur ? (
                <React.Fragment key={idx}>
                  <UserBubble
                    key={cur.uname}
                    displayEmails={authEmail === "oneweb@umich.edu"}
                    isOnline={onlineUsers.includes(cur.uname)}
                    openUserInfoSidebar={openUserInfoSidebar}
                    userInteraction={cur}
                    size={USER_BUBBLE_SIZE}
                    sx={{
                      position: "absolute",
                      bottom: cur.positionY - USER_BUBBLE_SIZE / 2,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                  {/* TODO: improve this by pushing and removing the new action dynamically
                  also this improvement is possible todo in the synchronization function */}
                  {cur.actions.map((action, index) => (
                    <MemoizedActionBubble
                      key={index}
                      actionType={action}
                      sx={{ position: "absolute", bottom: cur.positionY + 5 + index * 3, left: "-4px" }}
                    />
                  ))}
                </React.Fragment>
              ) : (
                <Box key={idx} sx={{ width: "28px", height: "28px" }} />
              )
            )}
          </Box>
        </Stack>
      </Box>

      {/* toggle button */}
      <Tooltip
        title={open ? `Hide ${SYNCHRONIZE_ABSOLUTE[variant].name}` : `Display ${SYNCHRONIZE_ABSOLUTE[variant].name}`}
      >
        <IconButton
          sx={{
            background: theme =>
              theme.palette.mode === "dark"
                ? theme.palette.common.darkBackground
                : theme.palette.common.lightBackground,
            display: "flex",
            top: "50%",
            transform: "translate(0px, -50%)",
            left: "-22px",
            width: "28px",
            height: "36px",
            color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            borderRadius: "6px 0px 0px 6px",
            cursor: "pointer",
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.notebookG50,
            },
          }}
          onClick={onToggleDisplay}
        >
          <ArrowForwardIosIcon
            fontSize="inherit"
            sx={{
              transform: !open ? "scaleX(-1)" : null,
            }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const MemoizedLivelinessBar = React.memo(LivelinessBar);
