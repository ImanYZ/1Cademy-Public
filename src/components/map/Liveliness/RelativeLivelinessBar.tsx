import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ActionsTracksChange, getActionTrackSnapshot } from "src/client/firestore/actionTracks.firestore";
import { User } from "src/knowledgeTypes";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import {
  getNumberOfUsersNoVisibleAbove,
  getNumberOfUsersNoVisibleBellow,
  getUsersAbove,
  getUsersBellow,
  RelativeLivelinessTypes,
  SYNCHRONIZE_RELATIVE,
  UserInteractionData,
  UserInteractions,
} from "./liveliness.utils";
import { PAST_24H } from "./LivelinessBar";
import { UserBubble } from "./UserBubble";

type RelativeLivelinessBarProps = {
  variant: RelativeLivelinessTypes;
  onlineUsers: string[];
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  onToggleDisplay: () => void;
  open: boolean;
  user: User;
  authEmail?: string;
};

const RelativeLivelinessBar = ({
  variant,
  onToggleDisplay,
  onlineUsers,
  open,
  openUserInfoSidebar,
  authEmail,
  user,
}: RelativeLivelinessBarProps) => {
  const db = getFirestore();
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});

  const usersInteractionsSortedArray = useMemo(
    () =>
      Object.keys(usersInteractions)
        .map(key => ({ ...usersInteractions[key], uname: key }))
        .sort((a, b) => a.count - b.count),
    [usersInteractions]
  );

  const userLogged = useMemo((): UserInteractionData => {
    const userLoggedActions = usersInteractionsSortedArray.find(c => c.uname === user.uname);
    return (
      userLoggedActions ?? {
        actions: [],
        chooseUname: user.chooseUname ?? false,
        count: 0,
        fullname: `${user.fName} ${user.lName}`,
        id: "00",
        imageUrl: user.imageUrl ?? "",
        reputation: null,
        uname: user.uname,
        email: user.email,
      }
    );
  }, [user.chooseUname, user.email, user.fName, user.imageUrl, user.lName, user.uname, usersInteractionsSortedArray]);

  const userActionsToDisplay: (UserInteractionData | null)[] = useMemo(() => {
    const usersAboveLoggedUser = getUsersAbove({ usersInteractionsSortedArray, uname: user.uname });
    const usersBellowLoggedUser = getUsersBellow({ usersInteractionsSortedArray, uname: user.uname }).reverse();
    return [
      ...[0, 1, 2].map(c => usersAboveLoggedUser[c] ?? null).reverse(),
      userLogged,
      ...[0, 1, 2].map(c => usersBellowLoggedUser[c] ?? null),
    ];
  }, [user.uname, userLogged, usersInteractionsSortedArray]);

  const numberOfUsersNoVisibleAbove = useMemo(
    () => getNumberOfUsersNoVisibleAbove({ uname: user.uname, usersInteractionsSortedArray }),
    [user.uname, usersInteractionsSortedArray]
  );

  const numberOfUsersNoVisibleBellow = useMemo(
    () => getNumberOfUsersNoVisibleBellow({ uname: user.uname, usersInteractionsSortedArray }),
    [user.uname, usersInteractionsSortedArray]
  );

  useEffect(() => {
    const onSynchronize = (changes: ActionsTracksChange[]) =>
      setUsersInteractions(prev => changes.reduce(SYNCHRONIZE_RELATIVE[variant].fn, { ...prev }));
    const killSnapshot = getActionTrackSnapshot(db, { rewindDate: PAST_24H }, onSynchronize);
    return () => killSnapshot();
  }, [db, variant]);

  return (
    <Box
      id={SYNCHRONIZE_RELATIVE[variant].id}
      role="feed"
      aria-label={`${SYNCHRONIZE_RELATIVE[variant].name}`}
      sx={{
        right: "0px",
        zIndex: 998,
        position: "absolute",
        top: "50%",
        transform: `translate(${open ? "0px" : "calc(100%)"}, -50%)`,
        width: "56px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.darkBackground : theme.palette.common.lightBackground,
        borderRadius: "10px 0px 0px 10px",
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
          {/* number of no visible users above */}
          <Box sx={{ minHeight: "25px" }}>
            <Typography>{numberOfUsersNoVisibleAbove > 0 && `+ ${numberOfUsersNoVisibleAbove}`}</Typography>
          </Box>
          <Stack
            justifyContent={"space-between"}
            spacing={"2px"}
            sx={{ height: "100%", transition: "0.2s", position: "relative" }}
          >
            <KeyboardArrowDownIcon
              sx={{
                fontSize: "20px",
                position: "absolute",
                left: "50%",
                top: "-14px",
                transform: "translateX(-50%)",
                color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
              }}
            />
            {/* background line */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: "-8px",
                bottom: "-8px",
                transform: "translateX(-1px)",
                borderLeft: theme =>
                  theme.palette.mode === "dark" ? "2px solid #bebebe" : "1px solid rgba(0, 0, 0, 0.6)",
              }}
            />

            {userActionsToDisplay.map((cur, idx) =>
              cur ? (
                <UserBubble
                  key={cur.uname}
                  displayEmails={authEmail === "oneweb@umich.edu"}
                  isOnline={onlineUsers.includes(cur.uname)}
                  openUserInfoSidebar={openUserInfoSidebar}
                  userInteraction={cur}
                  size={28}
                />
              ) : (
                <Box key={idx} sx={{ width: "28px", height: "28px" }} />
              )
            )}
          </Stack>
          {/* number of no visible users bellow */}
          <Box sx={{ minHeight: "25px" }}>
            <Typography>{numberOfUsersNoVisibleBellow > 0 && `+ ${numberOfUsersNoVisibleBellow}`}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* toggle button */}
      <Tooltip
        title={open ? `Hide ${SYNCHRONIZE_RELATIVE[variant].name}` : `Display ${SYNCHRONIZE_RELATIVE[variant].name}`}
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

export const MemoizedRelativeLivelinessBar = React.memo(RelativeLivelinessBar);
