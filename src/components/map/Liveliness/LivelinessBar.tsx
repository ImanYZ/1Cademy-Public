import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Tooltip, useTheme } from "@mui/material";
import { collection, Firestore, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { ActionTrackType } from "src/knowledgeTypes";
import { IActionTrack } from "src/types/IActionTrack";

import { MemoizedActionBubble } from "./ActionBubble";

type ILivelinessBarProps = {
  db: Firestore;
  openSidebar: boolean;
};

type UserInteractions = {
  [uname: string]: {
    reputation: "Gain" | "Loss" | null;
    imageUrl: string;
    count: number;
    actions: ActionTrackType[];
  };
};

const LivelinessBar = (props: ILivelinessBarProps) => {
  const { db, openSidebar } = props;
  const [open, setOpen] = useState(false);
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [barWidth, setBarWidth] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let t: any = null;
    const ts = new Date().getTime() - 3600000;
    const actionTracksCol = collection(db, "actionTracks");
    const q = query(actionTracksCol, where("createdAt", ">=", Timestamp.fromDate(new Date(ts))));
    const unsubscribe = onSnapshot(q, async snapshot => {
      setUsersInteractions(_usersInteractions => {
        const usersInteractions = { ..._usersInteractions };
        const docChanges = snapshot.docChanges();
        for (const docChange of docChanges) {
          const actionTrackData = docChange.doc.data() as IActionTrack;
          if (docChange.type === "added") {
            if (!usersInteractions.hasOwnProperty(actionTrackData.doer)) {
              usersInteractions[actionTrackData.doer] = {
                imageUrl: actionTrackData.imageUrl,
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
        }, 3000);

        return usersInteractions;
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setBarWidth(parseFloat(String(document.getElementById("liveliness-seekbar")?.clientWidth)));
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
    <Box
      sx={{
        transform: !open ? "translate(0px, calc(-100% + 30px))" : null,
        transition: "all 0.2s 0s ease",
        position: "relative",
        zIndex: 1199,
      }}
    >
      <Box
        sx={{
          position: "relative",
          background: "#1f1f1f",
          borderRadius: "0px 0px 10px 10px",
          width: "900px",
          maxWidth: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 0px 25px",
          [theme.breakpoints.down("lg")]: {
            width: !openSidebar ? "80%" : "75%",
            marginLeft: "50%",
            transform: !openSidebar ? "translate(-47%, 0px)" : "translate(-43%, 0px)",
          },
          [theme.breakpoints.down("md")]: {
            width: !openSidebar ? "585px" : "530px",
            transform: !openSidebar ? "translate(-45%, 0px)" : "translate(-38%, 0px)",
          },
          [theme.breakpoints.down("sm")]: {
            width: "320px",
            transform: "translate(-49%, 0px)",
          },
        }}
      >
        <Box
          className="seekbar"
          sx={{
            width: "calc(100% - 40px)",
            borderBottom: "2px solid #ffffff",
            position: "relative",
          }}
        >
          <ArrowForwardIosIcon
            sx={{
              fontSize: "14px",
              position: "absolute",
              right: "0px",
              transform: "translate(40%, -50%)",
            }}
          />
          <Box
            className="seekbar-users"
            id="liveliness-seekbar"
            sx={{
              width: "100%",
              position: "absolute",
              top: "0px",
              left: "0px",
              transform: "translate(0px, -50%)",
              "&:before": {
                content: '" "',
                border: "3px solid #ffffff",
                borderRadius: "50%",
                display: "inline-block",
                position: "absolute",
                left: "-4px",
                top: "-2px",
              },
            }}
          >
            {unames.map((uname: string) => {
              const seekPosition = (usersInteractions[uname].count / maxActions) * barWidth - 32;
              return (
                <Tooltip key={uname} title={uname}>
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
                      top: "0px",
                      transition: "all 0.2s 0s ease",
                      transform: `translate(${seekPosition}px, -50%)`,
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
                        position: "absolute",
                        top: "-18px",
                        left: "50%",
                        transform: "translate(-50%, 0px)",
                      }}
                    >
                      {usersInteractions[uname].actions.map((action, index) => {
                        return <MemoizedActionBubble key={index} actionType={action} />;
                      })}
                    </Box>
                    <Box className="user-image">
                      <Image src={usersInteractions[uname].imageUrl} width={28} height={28} />
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          background: "#1f1f1f",
          display: "flex",
          margin: "0 auto",
          width: "30px",
          height: "30px",
          color: "#ffffff",
          position: "relative",
          zIndex: 1199,
          alignItems: "center",
          justifyContent: "center",
          fontSize: "30px",
          borderRadius: "0px 0px 6px 6px",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <KeyboardArrowDownIcon
          fontSize="inherit"
          sx={{
            transform: open ? "scaleY(-1)" : null,
          }}
        />
      </Box>
    </Box>
  );
};

export const MemoizedLivelinessBar = React.memo(LivelinessBar);
