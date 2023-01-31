import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, Tooltip } from "@mui/material";
import { collection, Firestore, getDocs, limit, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { ActionTrackType } from "src/knowledgeTypes";
import { IActionTrack } from "src/types/IActionTrack";

type ILivelinessBarProps = {
  db: Firestore;
  onlineUsers: string[];
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  authEmail: string | undefined;
  user: any;
};

type UserInteractions = {
  [uname: string]: {
    reputation: "Gain" | "Loss" | null;
    count: number;
    actions: ActionTrackType[];
  };
};

const ReputationlinessBar = (props: ILivelinessBarProps) => {
  const { db, onlineUsers, openUserInfoSidebar, authEmail, user } = props;
  const [open, setOpen] = useState(false);
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [users, setUsers] = useState<any>({});
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
        const docChanges = snapshot.docChanges();
        for (const docChange of docChanges) {
          const actionTrackData = docChange.doc.data() as IActionTrack;
          for (const receiverData of actionTrackData.receivers) {
            const index = actionTrackData.receivers.indexOf(receiverData);
            const userQuery = query(collection(db, "users"), where("uname", "==", receiverData), limit(1));
            getDocs(userQuery).then(userData => {
              const user = userData.docs[0].data();
              setUsers((prevState: any) => {
                return {
                  ...prevState,
                  [user.uname]: {
                    imageUrl: user.imageUrl,
                    chooseUname: user.chooseUname,
                    email: user.email,
                    fullname: user.fName + " " + user.lName,
                  },
                };
              });
            });

            if (docChange.type === "added") {
              if (!usersInteractions.hasOwnProperty(receiverData)) {
                usersInteractions[receiverData] = {
                  count: 0,
                  actions: [],
                  reputation: null,
                };
              }
              if (actionTrackData.type === "NodeVote") {
                if (actionTrackData.action !== "CorrectRM" && actionTrackData.action !== "WrongRM") {
                  usersInteractions[receiverData].actions.push(actionTrackData.action as ActionTrackType);
                  usersInteractions[receiverData].count += actionTrackData.receiverPoints
                    ? Number(actionTrackData.receiverPoints[index])
                    : 0;
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
                  usersInteractions[receiverData].actions.push(currentAction);
                  usersInteractions[receiverData].count += actionTrackData.action.includes("Correct-") ? 1 : -1;
                  if (usersInteractions[receiverData].count < 0) {
                    usersInteractions[receiverData].count = 0;
                  }
                  for (const receiver of actionTrackData.receivers) {
                    if (usersInteractions.hasOwnProperty(receiver)) {
                      usersInteractions[receiver].reputation = currentAction === "Correct" ? "Gain" : "Loss";
                    }
                  }
                }
              }
            }

            if (docChange.type === "removed") {
              if (usersInteractions.hasOwnProperty(receiverData)) {
                usersInteractions[receiverData].count -= 1;
                if (usersInteractions[receiverData].count < 0) {
                  usersInteractions[receiverData].count = 0;
                }
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
        }, 3000);
      });
    };

    setInterval(() => {
      snapshotInitializer();
    }, 1440000);

    snapshotInitializer();

    return () => unsubscribe.finalizer();
  }, []);

  useEffect(() => {
    setBarHeight(parseFloat(String(document.getElementById("liveliness-seekbar")?.clientHeight)));
  }, []);

  const unames = useMemo(() => {
    return Object.keys(usersInteractions).filter(uname => user.uname === uname || usersInteractions[uname].count > 0);
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
    return (
      Math.max(
        10,
        unames.reduce(
          (carry, uname: string) => (carry < usersInteractions[uname].count ? usersInteractions[uname].count : carry),
          0
        )
      ) + Math.abs(minActions)
    );
  }, [usersInteractions, minActions]);

  return (
    <>
      <Box
        sx={{
          top: "120px",
          right: "0px",
          zIndex: 1199,
          position: "absolute",
          height: "calc(100% - 266px)",
        }}
      >
        <Box
          id="livebar"
          sx={{
            width: "56px",
            background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
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
          <Tooltip title={"24-hour Points Leaderboard."} placement="left">
            <Box sx={{ width: "100%", height: "100%", position: "absolute", right: "0px" }}></Box>
          </Tooltip>
          {window.innerHeight > 399 && (
            <Box sx={{ color: "ButtonHighlight", fontSize: "23px", marginLeft: "-15px", marginTop: "5px" }}>🏆</Box>
          )}
          <Box
            className="seekbar"
            sx={{
              height: `calc(100% - ${window.innerHeight > 399 ? "70px" : "28px"})`,
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
              {unames.map((uname: string) => {
                if (!users[uname]) {
                  return <></>;
                }
                const _count = usersInteractions[uname].count + Math.abs(minActions);
                const seekPosition = -1 * ((_count / maxActions) * barHeight - (_count === 0 ? 0 : 32));
                return (
                  <Tooltip
                    key={uname}
                    title={
                      <Box sx={{ textAlign: "center" }}>
                        <Box component={"span"}>{users[uname].chooseUname ? uname : users[uname].fullname}</Box>
                        {authEmail === "oneweb@umich.edu" && (
                          <Box component={"p"} sx={{ my: 0 }}>
                            {users[uname].email}
                          </Box>
                        )}
                        <Box component={"p"} sx={{ my: 0 }}>
                          {usersInteractions[uname].count.toFixed(2)} Point
                          {usersInteractions[uname].count > 1 ? "s" : ""}
                        </Box>
                      </Box>
                    }
                  >
                    <Box
                      onClick={() =>
                        openUserInfoSidebar(
                          uname,
                          users[uname].imageUrl,
                          users[uname].fullname,
                          users[uname].chooseUname ? "1" : ""
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
                      <Box className="user-image">
                        <Image src={users[uname].imageUrl} width={28} height={28} objectFit="cover" />
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
              background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
              display: "flex",
              top: "50%",
              transform: "translate(0px, -50%)",
              left: "-22px",
              width: "22px",
              height: "30px",
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

export const MemoizedReputationlinessBar = React.memo(ReputationlinessBar);
