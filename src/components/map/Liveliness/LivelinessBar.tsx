import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import { Firestore } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { ActionsTracksChange, getActionTrackSnapshot } from "src/client/firestore/actionTracks.firestore";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { MemoizedActionBubble } from "./ActionBubble";
import {
  calculateVerticalPositionWithLogarithm,
  LivelinessTypes,
  SYNCHRONIZE,
  UserInteractionDataProcessed,
  UserInteractions,
} from "./liveliness.utils";
import { UserBubble } from "./UserBubble";

type ILivelinessBarProps = {
  variant: LivelinessTypes;
  onToggleDisplay: () => void;
  db: Firestore;
  onlineUsers: string[];
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  authEmail: string | undefined;
  open: boolean;
  setOpen: (newOpen: boolean) => void;
  disabled?: boolean;
  windowHeight: number; // Should we remove it?
};

export const PAST_24H = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
const USER_BUBBLE_SIZE = 28;

const LivelinessBar = ({ variant, onToggleDisplay, open, ...props }: ILivelinessBarProps) => {
  const { db, onlineUsers, openUserInfoSidebar, authEmail } = props;
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [barHeight, setBarHeight] = useState<number>(0);
  const barRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onSynchronize = (changes: ActionsTracksChange[]) =>
      setUsersInteractions(prev => changes.reduce(SYNCHRONIZE[variant].fn, { ...prev }));
    const killSnapshot = getActionTrackSnapshot(db, { rewindDate: PAST_24H }, onSynchronize);
    return () => killSnapshot();
  }, [db, variant]);

  // useEffect(() => {
  //   setBarHeight(parseFloat(String(document.getElementById("liveliness-seekbar")?.clientHeight)));
  // }, [windowHeight]);

  useEffect(() => {
    if (!barRef.current) return;
    setBarHeight(barRef.current.clientHeight);
  }, []); // TODO: update with height window state

  const usersInteractionsArray: UserInteractionDataProcessed[] = useMemo(() => {
    const data = Object.keys(usersInteractions).map(key => ({ ...usersInteractions[key], uname: key }));
    return calculateVerticalPositionWithLogarithm({ data, height: barHeight });
  }, [barHeight, usersInteractions]);

  return (
    // <>
    //   <Box
    //     sx={{
    //       top: "50%",
    //       transform: "translateY(-50%)",
    //       right: "0px",
    //       zIndex: 1199,
    //       position: "absolute",
    //       height: `calc(100% - ${window.innerHeight > 799 ? "375px" : "420px"})`,
    //       border: "solid 1px red",
    //     }}
    //   >
    //     <Box
    //       id="live-bar-interaction"
    //       sx={{
    //         opacity: disabled ? 0.8 : 1,
    //         width: "56px",
    //         background: theme =>
    //           theme.palette.mode === "dark"
    //             ? theme.palette.common.darkBackground
    //             : theme.palette.common.lightBackground,
    //         borderRadius: "10px 0px 0px 10px",
    //         right: 0,
    //         top: 0,
    //         position: "absolute",
    //         height: "100%",
    //         transform: !open ? "translate(calc(100%), 0px)" : null,
    //         transition: "all 0.2s 0s ease",
    //         padding: "5px 0px 0px 28px",
    //       }}
    //     >
    //       <Tooltip title={"24-hour Interactions Leaderboard."} placement="left">
    //         <Box sx={{ width: "100%", height: "100%", position: "absolute", right: "0px" }}></Box>
    //       </Tooltip>

    //       <Box
    //         className="seekbar"
    //         sx={{
    //           height: `calc(100% - ${window.innerHeight > 799 ? "30px" : "28px"})`,
    //           width: "1px",
    //           borderRight: theme =>
    //             theme.palette.mode === "dark" ? "2px solid #bebebe" : "2px solid rgba(0, 0, 0, 0.6)",
    //           color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
    //           position: "relative",
    //           marginTop: "10px",
    //         }}
    //       >
    //         <KeyboardArrowDownIcon
    //           sx={{
    //             fontSize: "20px",
    //             position: "absolute",
    //             top: "0px",
    //             transform: "translate(-9px, -9px)",
    //           }}
    //         />
    //         <Box
    //           className="seekbar-users"
    //           id="liveliness-seekbar"
    //           sx={{
    //             width: "100%",
    //             height: "100%",
    //             position: "absolute",
    //             top: "0px",
    //           }}
    //         >
    //           {disabled &&
    //             [1, 2, 3].map(cur => {
    //               return (
    //                 <Box
    //                   key={cur}
    //                   sx={{
    //                     width: "28px",
    //                     height: "28px",
    //                     position: "absolute",
    //                     transform: `translate(-50%, ${cur * 10}px)`,
    //                     borderRadius: "50%",
    //                     background: theme => (theme.palette.mode === "dark" ? "#575757ff" : "#d4d4d4"),
    //                   }}
    //                 />
    //               );
    //             })}
    //           {!disabled &&
    //             Object.keys(usersInteractions).map((uname: string) => {
    //               const maxActionsLog = Math.log(maxActions);
    //               const totalInteraction = usersInteractions[uname].count + Math.abs(minActions);
    //               const _count = Math.log(totalInteraction > 0 ? totalInteraction : 1);
    //               const seekPosition = -1 * ((_count / maxActionsLog) * barHeight - (_count === 0 ? 0 : 35));
    //               return (
    //                 <Tooltip
    //                   key={uname}
    //                   title={
    //                     <Box sx={{ textAlign: "center" }}>
    //                       <Box component={"span"}>
    //                         {usersInteractions[uname].chooseUname ? uname : usersInteractions[uname].fullname}
    //                       </Box>
    //                       {authEmail === "oneweb@umich.edu" && (
    //                         <Box component={"p"} sx={{ my: 0 }}>
    //                           {usersInteractions[uname].email}
    //                         </Box>
    //                       )}
    //                       <Box component={"p"} sx={{ my: 0 }}>
    //                         {usersInteractions[uname].count} Interaction{usersInteractions[uname].count > 1 ? "s" : ""}
    //                       </Box>
    //                     </Box>
    //                   }
    //                 >
    //                   <Box
    //                     onClick={() =>
    //                       openUserInfoSidebar(
    //                         uname,
    //                         usersInteractions[uname].imageUrl,
    //                         usersInteractions[uname].fullname,
    //                         usersInteractions[uname].chooseUname ? "1" : ""
    //                       )
    //                     }
    //                     className={
    //                       usersInteractions[uname].reputation === "Gain"
    //                         ? "GainedPoint"
    //                         : usersInteractions[uname].reputation === "Loss"
    //                         ? "LostPoint"
    //                         : ""
    //                     }
    //                     sx={{
    //                       width: "28px",
    //                       height: "28px",
    //                       cursor: "pointer",
    //                       // display: "inline-block",
    //                       position: "absolute",
    //                       left: "0px",
    //                       bottom: "0px",
    //                       transition: "all 0.2s 0s ease",
    //                       transform: `translate(-50%, ${seekPosition}px)`,
    //                       "& > .user-image": {
    //                         borderRadius: "50%",
    //                         overflow: "hidden",
    //                         width: "28px",
    //                         height: "28px",
    //                       },
    //                       "&.GainedPoint": {
    //                         "& > .user-image": {
    //                           boxShadow: "1px 1px 13px 4px rgba(21, 255, 0, 1)",
    //                         },
    //                       },
    //                       "&.LostPoint": {
    //                         "& > .user-image": {
    //                           boxShadow: "1px 1px 13px 4px rgba(255, 0, 0, 1)",
    //                         },
    //                       },
    //                       "@keyframes slidein": {
    //                         from: {
    //                           transform: "translateY(0%)",
    //                         },
    //                         to: {
    //                           transform: "translateY(100%)",
    //                         },
    //                       },
    //                     }}
    //                   >
    //                     <Box
    //                       sx={{
    //                         // display: "block",
    //                         position: "absolute",
    //                         bottom: "6px",
    //                         left: "-16px",
    //                       }}
    //                     >
    //                       {usersInteractions[uname].actions.map((action, index) => {
    //                         return <MemoizedActionBubble key={index} actionType={action} />;
    //                       })}
    //                     </Box>
    //                     <Box className="user-image">
    //                       <OptimizedAvatar2
    //                         alt={usersInteractions[uname].fullname}
    //                         imageUrl={usersInteractions[uname].imageUrl}
    //                         size={28}
    //                         sx={{ border: "none" }}
    //                       />
    //                     </Box>
    //                     {onlineUsers.includes(uname) && (
    //                       <Box
    //                         sx={{
    //                           background: "#12B76A",
    //                         }}
    //                         className="UserStatusOnlineIcon"
    //                       />
    //                     )}
    //                   </Box>
    //                 </Tooltip>
    //               );
    //             })}
    //         </Box>
    //       </Box>
    //       <Box
    //         sx={{
    //           background: theme =>
    //             theme.palette.mode === "dark"
    //               ? theme.palette.common.darkBackground
    //               : theme.palette.common.lightBackground,
    //           display: "flex",
    //           top: "50%",
    //           transform: "translate(0px, -50%)",
    //           left: "-22px",
    //           width: "28px",
    //           height: "36px",
    //           color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
    //           position: "absolute",
    //           alignItems: "center",
    //           justifyContent: "center",
    //           fontSize: "20px",
    //           borderRadius: "6px 0px 0px 6px",
    //           cursor: "pointer",
    //         }}
    //         onClick={() => setOpen(!open)}
    //       >
    //         <ArrowForwardIosIcon
    //           fontSize="inherit"
    //           sx={{
    //             transform: !open ? "scaleX(-1)" : null,
    //           }}
    //         />
    //       </Box>
    //     </Box>
    //   </Box>
    // </>
    <Box
      id={SYNCHRONIZE[variant].id}
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
        border: "solid 1px olive",
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
          <Box
            ref={barRef}
            sx={{ width: "100%", height: "100%", transition: "0.2s", position: "relative", border: "solid 1px olive" }}
          >
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
                <>
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
                  {cur.actions.map((action, index) => (
                    <MemoizedActionBubble
                      key={index}
                      actionType={action}
                      sx={{ position: "absolute", bottom: cur.positionY + 8, left: "-4px" }}
                    />
                  ))}
                </>
              ) : (
                <Box key={idx} sx={{ width: "28px", height: "28px" }} />
              )
            )}
          </Box>
        </Stack>
      </Box>

      {/* toggle button */}
      <Tooltip title={open ? `Hide ${SYNCHRONIZE[variant].name}` : `Display ${SYNCHRONIZE[variant].name}`}>
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
