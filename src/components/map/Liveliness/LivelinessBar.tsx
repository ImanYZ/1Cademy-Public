import { Box, Tooltip } from "@mui/material";
import { collection, Firestore, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { IActionTrack } from "src/types/IActionTrack";

import { MemoizedActionBubble } from "./ActionBubble";

type ILivelinessBarProps = {
  db: Firestore;
};

type UserInteractions = {
  [uname: string]: {
    imageUrl: string;
    count: number;
  };
};

function LivelinessBarComponent(props: ILivelinessBarProps) {
  const { db } = props;
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [barWidth, setBarWidth] = useState<number>(0);

  useEffect(() => {
    const ts = new Date().getTime() - 86400000;
    const actionTracksCol = collection(db, "actionTracks");
    const q = query(actionTracksCol, where("createdAt", ">=", Timestamp.fromDate(new Date(ts))));
    onSnapshot(q, async snapshot => {
      let _usersInteractions = { ...usersInteractions };
      const docChanges = snapshot.docChanges();
      for (const docChange of docChanges) {
        const actionTrackData = docChange.doc.data() as IActionTrack;
        if (docChange.type === "added") {
          if (!_usersInteractions.hasOwnProperty(actionTrackData.doer)) {
            _usersInteractions[actionTrackData.doer] = {
              imageUrl: actionTrackData.imageUrl,
              count: 0,
            };
          }
          _usersInteractions[actionTrackData.doer].count += 1;
        }
        if (docChange.type === "removed") {
          if (_usersInteractions.hasOwnProperty(actionTrackData.doer)) {
            _usersInteractions[actionTrackData.doer].count -= 1;
            if (_usersInteractions[actionTrackData.doer].count < 0) {
              _usersInteractions[actionTrackData.doer].count = 0;
            }
          }
        }
      }
      setUsersInteractions(_usersInteractions);
    });
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
        position: "relative",
        zIndex: 1300,
        background: "#1f1f1f",
        borderRadius: "0px 0px 10px 10px",
        width: "900px",
        maxWidth: "100%",
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px 0px 25px",
      }}
    >
      <Box
        className="seekbar"
        sx={{
          width: "calc(100% - 20px)",
          borderBottom: "2px solid #ffffff",
          position: "relative",
        }}
      >
        <Box
          className="seekbar-users"
          id="liveliness-seekbar"
          sx={{
            width: "100%",
            position: "absolute",
            top: "0px",
            left: "0px",
            transform: "translate(0px, -50%)",
            "&:after": {
              content: '" "',
              border: "3px solid #ffffff",
              borderRadius: "50%",
              display: "inline-block",
              position: "absolute",
              right: "-4px",
              top: "-2px",
            },
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
            const seekPosition = (usersInteractions[uname].count / maxActions) * barWidth - 28;
            return (
              <Tooltip key={uname} title={uname}>
                <Box
                  // className="GainedPoint"
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
                    {/* <MemoizedActionBubble actionType="Correct" /> */}
                    <MemoizedActionBubble actionType="Correct" />
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
  );
}

export const LivelinessBar = React.memo(LivelinessBarComponent);
