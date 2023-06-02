import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, Tooltip, Typography } from "@mui/material";
import { collection, Firestore, getDocs, limit, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { ActionTrackType } from "src/knowledgeTypes";
import { IActionTrack } from "src/types/IActionTrack";

import { DESIGN_SYSTEM_COLORS } from "../../../lib/theme/colors";
import { DEFAULT_AVATAR } from "../../../lib/utils/constants";
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

type UserInteractions = {
  [uname: string]: {
    reputation: "Gain" | "Loss" | null;
    imageUrl: string;
    chooseUname: boolean;
    fullname: string;
    count: number;
    actions: ActionTrackType[];
    email?: string;
  };
};

const LivelinessBar = ({ open, setOpen, disabled = false, ...props }: ILivelinessBarProps) => {
  const { db, onlineUsers, openUserInfoSidebar, authEmail, windowHeight } = props;
  // const [open, setOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [barHeight, setBarHeight] = useState<number>(0);
  // const theme = useTheme();
  useEffect(() => {
    if (window && window.innerWidth > 768 && window.innerHeight >= 797) {
      setOpen(true);
    }
    if (disabled) return;

    let t: any = null;
    const unsubscribe: {
      finalizer: () => void;
    } = {
      finalizer: () => {},
    };
    const snapshotInitializer = () => {
      setUsersInteractions({});
      unsubscribe.finalizer();
      const ts = new Date().getTime() - 86400000;
      const actionTracksCol = collection(db, "actionTracks");
      const q = query(actionTracksCol, where("createdAt", ">=", Timestamp.fromDate(new Date(ts))));
      unsubscribe.finalizer = onSnapshot(q, async snapshot => {
        const docChanges = snapshot.docChanges();
        for (const docChange of docChanges) {
          const actionTrackData = docChange.doc.data() as IActionTrack;

          // TODO: get user data
          let doerEmail: string = "";
          if (docChange.type === "added") {
            if (!usersInteractions.hasOwnProperty(actionTrackData.doer)) {
              if (authEmail === "oneweb@umich.edu") {
                let userQuery = query(collection(db, "users"), where("uname", "==", actionTrackData.doer), limit(1));
                let userDocs = await getDocs(userQuery);
                if (userDocs.docs.length > 0) {
                  doerEmail = userDocs.docs[0].data().email;
                }
              }
              usersInteractions[actionTrackData.doer] = {
                imageUrl: actionTrackData.imageUrl,
                chooseUname: actionTrackData.chooseUname,
                fullname: actionTrackData.fullname,
                count: 0,
                actions: [],
                reputation: null,
                email: doerEmail,
              };
            }
            if (actionTrackData.type === "NodeVote") {
              if (actionTrackData.action !== "CorrectRM" && actionTrackData.action !== "WrongRM") {
                usersInteractions[actionTrackData.doer].actions.push(actionTrackData.action as ActionTrackType);
                usersInteractions[actionTrackData.doer].count += 1;
                for (const receiver of actionTrackData.receivers) {
                  if (usersInteractions.hasOwnProperty(receiver)) {
                    usersInteractions[receiver].reputation = actionTrackData.action === "Correct" ? "Gain" : "Loss";
                  }
                }
              }
            } else if (actionTrackData.type === "RateVersion") {
              if (actionTrackData.action.includes("Correct-") || actionTrackData.action.includes("Wrong-")) {
                const currentAction: ActionTrackType = actionTrackData.action.includes("Correct-")
                  ? "Correct"
                  : "Wrong";
                usersInteractions[actionTrackData.doer].actions.push(currentAction);
                usersInteractions[actionTrackData.doer].count += 1;
                for (const receiver of actionTrackData.receivers) {
                  if (usersInteractions.hasOwnProperty(receiver)) {
                    usersInteractions[receiver].reputation = currentAction === "Correct" ? "Gain" : "Loss";
                  }
                }
              }
            } else {
              usersInteractions[actionTrackData.doer].actions.push(actionTrackData.type as ActionTrackType);
              usersInteractions[actionTrackData.doer].count += 1;
            }
          }
          if (docChange.type === "modified") {
            if (usersInteractions.hasOwnProperty(actionTrackData.doer)) {
              usersInteractions[actionTrackData.doer].imageUrl = actionTrackData.imageUrl;
              usersInteractions[actionTrackData.doer].fullname = actionTrackData.fullname;
            }
          }
          if (docChange.type === "removed") {
            if (usersInteractions.hasOwnProperty(actionTrackData.doer)) {
              usersInteractions[actionTrackData.doer].count -= 1;
              if (usersInteractions[actionTrackData.doer].count < 0) {
                usersInteractions[actionTrackData.doer].count = 0;
              }
            }
          }
        }
        setUsersInteractions({ ...usersInteractions });
        if (t) {
          clearTimeout(t);
        }
        t = setTimeout(() => {
          setUsersInteractions(usersInteractions => {
            let _usersInteractions = { ...usersInteractions } as UserInteractions;
            for (let uname in _usersInteractions) {
              _usersInteractions[uname].actions = [];
              _usersInteractions[uname].reputation = null;
            }
            return _usersInteractions;
          });
          setIsInitialized(true);
        }, 3000);
      });
    };

    setInterval(() => {
      snapshotInitializer();
    }, 1440000);

    snapshotInitializer();

    return () => unsubscribe.finalizer();
  }, [disabled]);

  useEffect(() => {
    setBarHeight(parseFloat(String(document.getElementById("liveliness-seekbar")?.clientHeight)));
  }, [windowHeight]);

  const unames = useMemo(() => {
    return Object.keys(usersInteractions);
  }, [usersInteractions]);

  const minActions: number = useMemo(() => {
    return Math.min(
      0,
      unames.reduce(
        (carry, uname: string) => (carry > usersInteractions[uname].count ? usersInteractions[uname].count : carry),
        0
      )
    );
  }, [usersInteractions]);

  const maxActions: number = useMemo(() => {
    return Math.max(
      10,
      unames.reduce(
        (carry, uname: string) => (carry < usersInteractions[uname].count ? usersInteractions[uname].count : carry),
        0
      )
    );
  }, [usersInteractions, minActions]);
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
                unames.map((uname: string) => {
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
                            display: isInitialized ? "block" : "none",
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
                          {usersInteractions[uname].imageUrl && usersInteractions[uname].imageUrl !== DEFAULT_AVATAR ? (
                            <Image src={usersInteractions[uname].imageUrl} width={28} height={28} objectFit="cover" />
                          ) : (
                            <Box sx={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                              <Typography
                                sx={{ fontSize: "12px", fontWeight: "600", color: DESIGN_SYSTEM_COLORS.baseWhite }}
                              >
                                NAME HERE
                                {/* {`${users[uname].fullname.split(" ")[0].charAt(0).toUpperCase()}${users[uname].fullname
                                  .split(" ")[1]
                                  ?.charAt(0)
                                  .toUpperCase()}`} */}
                              </Typography>
                            </Box>
                          )}
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
