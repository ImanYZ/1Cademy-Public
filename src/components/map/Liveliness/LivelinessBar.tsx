import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, Tooltip } from "@mui/material";
import { Firestore } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import { ActionsTracksChange, getActionTrackSnapshot } from "src/client/firestore/actionTracks.firestore";
import { ActionTrackType } from "src/knowledgeTypes";
import { IActionTrack } from "src/types/IActionTrack";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

import { MemoizedActionBubble } from "./ActionBubble";

type ILivelinessBarProps = {
  db: Firestore;
  onlineUsers: string[];
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  authEmail: string | undefined;
  open: boolean;
  setOpen: (newOpen: boolean) => void;
  disabled?: boolean;
  windowHeight: number;
};

export type UserInteraction = {
  id: string;
  reputation: "Gain" | "Loss" | null;
  imageUrl: string;
  chooseUname: boolean;
  fullname: string;
  count: number;
  actions: ActionTrackType[];
  email?: string;
};

export type UserInteractions = {
  [uname: string]: UserInteraction;
};

export type UserInteractionData = UserInteraction & { uname: string };

export const PAST_24H = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

const LivelinessBar = ({ open, setOpen, disabled = false, ...props }: ILivelinessBarProps) => {
  const { db, onlineUsers, openUserInfoSidebar, authEmail, windowHeight } = props;
  // const [open, setOpen] = useState(false);
  // const [isInitialized, setIsInitialized] = useState(false);
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [barHeight, setBarHeight] = useState<number>(0);

  // const theme = useTheme();

  const syncLivelinessBar = useCallback(
    (changes: ActionsTracksChange[]) => {
      // console.log({ changes });
      setUsersInteractions(prevUsersInteractions => {
        // Following sync wrap help us query user data during
        // processing userInteractions came up in snapshot changes
        const _interactions = changes.reduce((acu, cur) => synchronizeActionsTracks(acu, cur, authEmail || ""), {
          ...prevUsersInteractions,
        });
        // console.log("02", { _interactions });
        return _interactions;
      });
    },
    [authEmail]
  );

  useEffect(() => {
    const killSnapshot = getActionTrackSnapshot(db, { rewindDate: PAST_24H }, syncLivelinessBar);
    return () => killSnapshot();
  }, [db, syncLivelinessBar]);

  useEffect(() => {
    setBarHeight(parseFloat(String(document.getElementById("liveliness-seekbar")?.clientHeight)));
  }, [windowHeight]);

  const minActions: number = useMemo(() => {
    return Math.min(
      0,
      Object.keys(usersInteractions).reduce(
        (carry, uname: string) => (carry > usersInteractions[uname].count ? usersInteractions[uname].count : carry),
        0
      )
    );
  }, [usersInteractions]);

  const maxActions: number = useMemo(() => {
    return Math.max(
      10,
      Object.keys(usersInteractions).reduce(
        (carry, uname: string) => (carry < usersInteractions[uname].count ? usersInteractions[uname].count : carry),
        0
      )
    );
  }, [usersInteractions]);
  // console.log({ disabled });
  // console.log("03", { usersInteractions });

  // const userInteractions = useMemo(() => {
  //   return Object.keys(usersInteractions);
  // }, [usersInteractions]);

  // console.log("04", { userInteractions });
  return (
    <>
      <Box
        sx={{
          top: "50%",
          transform: "translateY(-50%)",
          right: "0px",
          zIndex: 1199,
          position: "absolute",
          height: `calc(100% - ${window.innerHeight > 799 ? "375px" : "420px"})`,
          border: "solid 1px red",
        }}
      >
        <Box
          id="live-bar-interaction"
          sx={{
            opacity: disabled ? 0.8 : 1,
            width: "56px",
            background: theme =>
              theme.palette.mode === "dark"
                ? theme.palette.common.darkBackground
                : theme.palette.common.lightBackground,
            borderRadius: "10px 0px 0px 10px",
            right: 0,
            top: 0,
            position: "absolute",
            height: "100%",
            transform: !open ? "translate(calc(100%), 0px)" : null,
            transition: "all 0.2s 0s ease",
            padding: "5px 0px 0px 28px",
          }}
        >
          <Tooltip title={"24-hour Interactions Leaderboard."} placement="left">
            <Box sx={{ width: "100%", height: "100%", position: "absolute", right: "0px" }}></Box>
          </Tooltip>

          <Box
            className="seekbar"
            sx={{
              height: `calc(100% - ${window.innerHeight > 799 ? "30px" : "28px"})`,
              width: "1px",
              borderRight: theme =>
                theme.palette.mode === "dark" ? "2px solid #bebebe" : "2px solid rgba(0, 0, 0, 0.6)",
              color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
              position: "relative",
              marginTop: "10px",
            }}
          >
            <KeyboardArrowDownIcon
              sx={{
                fontSize: "20px",
                position: "absolute",
                top: "0px",
                transform: "translate(-9px, -9px)",
              }}
            />
            <Box
              className="seekbar-users"
              id="liveliness-seekbar"
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: "0px",
              }}
            >
              {disabled &&
                [1, 2, 3].map(cur => {
                  return (
                    <Box
                      key={cur}
                      sx={{
                        width: "28px",
                        height: "28px",
                        position: "absolute",
                        transform: `translate(-50%, ${cur * 10}px)`,
                        borderRadius: "50%",
                        background: theme => (theme.palette.mode === "dark" ? "#575757ff" : "#d4d4d4"),
                      }}
                    />
                  );
                })}
              {!disabled &&
                Object.keys(usersInteractions).map((uname: string) => {
                  const maxActionsLog = Math.log(maxActions);
                  const totalInteraction = usersInteractions[uname].count + Math.abs(minActions);
                  const _count = Math.log(totalInteraction > 0 ? totalInteraction : 1);
                  const seekPosition = -1 * ((_count / maxActionsLog) * barHeight - (_count === 0 ? 0 : 35));
                  return (
                    <Tooltip
                      key={uname}
                      title={
                        <Box sx={{ textAlign: "center" }}>
                          <Box component={"span"}>
                            {usersInteractions[uname].chooseUname ? uname : usersInteractions[uname].fullname}
                          </Box>
                          {authEmail === "oneweb@umich.edu" && (
                            <Box component={"p"} sx={{ my: 0 }}>
                              {usersInteractions[uname].email}
                            </Box>
                          )}
                          <Box component={"p"} sx={{ my: 0 }}>
                            {usersInteractions[uname].count} Interaction{usersInteractions[uname].count > 1 ? "s" : ""}
                          </Box>
                        </Box>
                      }
                    >
                      <Box
                        onClick={() =>
                          openUserInfoSidebar(
                            uname,
                            usersInteractions[uname].imageUrl,
                            usersInteractions[uname].fullname,
                            usersInteractions[uname].chooseUname ? "1" : ""
                          )
                        }
                        className={
                          usersInteractions[uname].reputation === "Gain"
                            ? "GainedPoint"
                            : usersInteractions[uname].reputation === "Loss"
                            ? "LostPoint"
                            : ""
                        }
                        sx={{
                          width: "28px",
                          height: "28px",
                          cursor: "pointer",
                          // display: "inline-block",
                          position: "absolute",
                          left: "0px",
                          bottom: "0px",
                          transition: "all 0.2s 0s ease",
                          transform: `translate(-50%, ${seekPosition}px)`,
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
                        <Box
                          sx={{
                            // display: "block",
                            position: "absolute",
                            bottom: "6px",
                            left: "-16px",
                          }}
                        >
                          {usersInteractions[uname].actions.map((action, index) => {
                            return <MemoizedActionBubble key={index} actionType={action} />;
                          })}
                        </Box>
                        <Box className="user-image">
                          <OptimizedAvatar2
                            alt={usersInteractions[uname].fullname}
                            imageUrl={usersInteractions[uname].imageUrl}
                            size={28}
                            sx={{ border: "none" }}
                          />
                        </Box>
                        {onlineUsers.includes(uname) && (
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
                })}
            </Box>
          </Box>
          <Box
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
            }}
            onClick={() => setOpen(!open)}
          >
            <ArrowForwardIosIcon
              fontSize="inherit"
              sx={{
                transform: !open ? "scaleX(-1)" : null,
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export const MemoizedLivelinessBar = React.memo(LivelinessBar);

export const synchronizeActionsTracks = (
  prevUserInteractions: UserInteractions,
  actionTrackChange: ActionsTracksChange,
  authEmail: string
) => {
  const docType = actionTrackChange.type;
  const curData = actionTrackChange.data as IActionTrack & { id: string };

  if (docType === "added") {
    if (!prevUserInteractions.hasOwnProperty(curData.doer)) {
      prevUserInteractions[curData.doer] = {
        id: curData.id,
        imageUrl: curData.imageUrl,
        chooseUname: curData.chooseUname,
        fullname: curData.fullname,
        count: 0,
        actions: [],
        reputation: null,
        email: authEmail === "oneweb@umich.edu" ? curData.email : "",
      };
    }
    if (curData.type === "NodeVote") {
      if (curData.action !== "CorrectRM" && curData.action !== "WrongRM") {
        prevUserInteractions[curData.doer].actions.push(curData.action as ActionTrackType);
        prevUserInteractions[curData.doer].count += 1;
        for (const receiver of curData.receivers) {
          if (prevUserInteractions.hasOwnProperty(receiver)) {
            prevUserInteractions[receiver].reputation = curData.action === "Correct" ? "Gain" : "Loss";
          }
        }
      }
    } else if (curData.type === "RateVersion") {
      if (curData.action.includes("Correct-") || curData.action.includes("Wrong-")) {
        const currentAction: ActionTrackType = curData.action.includes("Correct-") ? "Correct" : "Wrong";
        prevUserInteractions[curData.doer].actions.push(currentAction);
        prevUserInteractions[curData.doer].count += 1;
        for (const receiver of curData.receivers) {
          if (prevUserInteractions.hasOwnProperty(receiver)) {
            prevUserInteractions[receiver].reputation = currentAction === "Correct" ? "Gain" : "Loss";
          }
        }
      }
    } else {
      prevUserInteractions[curData.doer].actions.push(curData.type as ActionTrackType);
      prevUserInteractions[curData.doer].count += 1;
    }
  }
  if (docType === "modified") {
    prevUserInteractions[curData.doer].imageUrl = curData.imageUrl;
    prevUserInteractions[curData.doer].fullname = curData.fullname;
  }

  if (docType === "removed") {
    prevUserInteractions[curData.doer].count -= 1;
    if (prevUserInteractions[curData.doer].count <= 0) delete prevUserInteractions[curData.doer];
  }
  return prevUserInteractions;
};
