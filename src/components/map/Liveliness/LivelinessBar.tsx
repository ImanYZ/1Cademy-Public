import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, Tooltip } from "@mui/material";
import { collection, Firestore, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { ActionTrackType } from "src/knowledgeTypes";
import { IActionTrack } from "src/types/IActionTrack";

import { MemoizedActionBubble } from "./ActionBubble";

type ILivelinessBarProps = {
  db: Firestore;
  onlineUsers: string[];
};

type UserInteractions = {
  [uname: string]: {
    reputation: "Gain" | "Loss" | null;
    imageUrl: string;
    chooseUname: boolean;
    fullname: string;
    count: number;
    actions: ActionTrackType[];
  };
};

const LivelinessBar = (props: ILivelinessBarProps) => {
  const { db, onlineUsers } = props;
  const [open, setOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [barHeight, setBarHeight] = useState<number>(0);
  // const theme = useTheme();

  useEffect(() => {
    if (window && window.innerWidth > 768 && window.innerHeight >= 797) {
      setOpen(true);
    }
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
        setUsersInteractions(_usersInteractions => {
          const usersInteractions = { ..._usersInteractions };
          const docChanges = snapshot.docChanges();
          for (const docChange of docChanges) {
            const actionTrackData = docChange.doc.data() as IActionTrack;
            if (docChange.type === "added") {
              if (!usersInteractions.hasOwnProperty(actionTrackData.doer)) {
                usersInteractions[actionTrackData.doer] = {
                  imageUrl: actionTrackData.imageUrl,
                  chooseUname: actionTrackData.chooseUname,
                  fullname: actionTrackData.fullname,
                  count: 0,
                  actions: [],
                  reputation: null,
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

          setUsersInteractions(usersInteractions => {
            return usersInteractions;
          });

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
          return usersInteractions;
        });
      });
    };

    setInterval(() => {
      snapshotInitializer();
    }, 3600000);

    snapshotInitializer();

    return () => unsubscribe.finalizer();
  }, []);

  useEffect(() => {
    setBarHeight(parseFloat(String(document.getElementById("liveliness-seekbar")?.clientHeight)));
  }, []);

  const unames = useMemo(() => {
    return Object.keys(usersInteractions);
  }, [usersInteractions]);

  const maxActions: number = useMemo(() => {
    return Math.max(
      10,
      unames.reduce(
        (carry, uname: string) => (carry < usersInteractions[uname].count ? usersInteractions[uname].count : carry),
        0
      )
    );
  }, [usersInteractions]);

  return (
    <>
      <Box
        sx={{
          top: "120px",
          right: "0px",
          zIndex: 1199,
          position: "absolute",
          height: "calc(100% - 220px)",
        }}
      >
        <Box
          id="livebar"
          sx={{
            width: "56px",
            background: "#1f1f1f",
            borderRadius: "10px 0px 0px 10px",
            right: 0,
            top: 0,
            position: "absolute",
            height: "100%",
            transform: !open ? "translate(calc(100%), 0px)" : null,
            transition: "all 0.2s 0s ease",
            padding: "0px 0px 0px 32px",
          }}
        >
          <Box
            className="seekbar"
            sx={{
              height: "calc(100% - 40px)",
              width: "1px",
              borderRight: "2px solid #bebebe",
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
              {unames.map((uname: string) => {
                const seekPosition = -1 * ((usersInteractions[uname].count / maxActions) * barHeight - 32);
                return (
                  <Tooltip
                    key={uname}
                    title={usersInteractions[uname].chooseUname ? uname : usersInteractions[uname].fullname}
                  >
                    <Box
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
                        <Image src={usersInteractions[uname].imageUrl} width={28} height={28} objectFit="cover" />
                      </Box>
                      <Box className={onlineUsers.includes(uname) ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"} />
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
          <Box
            sx={{
              background: "#1f1f1f",
              display: "flex",
              top: "50%",
              transform: "translate(0px, -50%)",
              left: "-22px",
              width: "22px",
              height: "30px",
              color: "#bebebe",
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
