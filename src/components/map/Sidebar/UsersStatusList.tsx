import { Stack, SxProps, Theme } from "@mui/material";
import { collection, documentId, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { ReputationSignal } from "src/knowledgeTypes";

import { OpenSidebar } from "@/pages/notebook";

import { useAuth } from "../../../context/AuthContext";
import { loadReputationsData } from "../../../lib/utils/Map.utils";
import { UsersStatus } from "../../../nodeBookTypes";
// import { UsersStatus } from "../../../noteBookTypes";
import { MemoizedUserStatusIcon } from "../UserStatusIcon";

// const scale = 1;
type DictByReputationType = {
  "All Time": any;
  Monthly: any;
  Weekly: any;
  "Others Votes": any;
  "Others Monthly": any;
};

const usersListObjFromReputationObj = (user: any, userReputation: any, uname: string) => {
  const reputationObj = {
    ...user,
    ...userReputation,
    uname,
    totalPoints:
      ("totalPoints" in userReputation && userReputation.totalPoints) ||
      userReputation.cnCorrects +
        userReputation.cnInst -
        userReputation.cnWrongs +
        userReputation.cdCorrects +
        userReputation.cdInst -
        userReputation.cdWrongs +
        userReputation.qCorrects +
        userReputation.qInst -
        userReputation.qWrongs +
        userReputation.pCorrects +
        userReputation.pInst -
        userReputation.pWrongs +
        userReputation.sCorrects +
        userReputation.sInst -
        userReputation.sWrongs +
        userReputation.aCorrects +
        userReputation.aInst -
        userReputation.aWrongs +
        userReputation.rfCorrects +
        userReputation.rfInst -
        userReputation.rfWrongs +
        userReputation.nCorrects +
        userReputation.nInst -
        userReputation.nWrongs +
        userReputation.mCorrects +
        userReputation.mInst -
        userReputation.mWrongs +
        userReputation.iCorrects +
        userReputation.iInst -
        userReputation.iWrongs +
        userReputation.lterm,
    totalPositives:
      ("positives" in userReputation && userReputation.positives) ||
      userReputation.cnCorrects +
        userReputation.cdCorrects +
        userReputation.qCorrects +
        userReputation.pCorrects +
        userReputation.sCorrects +
        userReputation.aCorrects +
        userReputation.rfCorrects +
        userReputation.nCorrects +
        userReputation.mCorrects +
        userReputation.iCorrects +
        userReputation.lterm,
    totalNegatives:
      ("negatives" in userReputation && userReputation.negatives) ||
      userReputation.cnWrongs +
        userReputation.cdWrongs +
        userReputation.qWrongs +
        userReputation.pWrongs +
        userReputation.sWrongs +
        userReputation.aWrongs +
        userReputation.rfWrongs +
        userReputation.nWrongs +
        userReputation.mWrongs +
        userReputation.iWrongs,
  };
  reputationObj.totalPositives = !isNaN(reputationObj.totalPositives) ? reputationObj.totalPositives : 0;
  reputationObj.totalNegatives = !isNaN(reputationObj.totalNegatives) ? reputationObj.totalNegatives : 0;
  reputationObj.totalPoints = !isNaN(reputationObj.totalPoints) ? reputationObj.totalPoints : 0;
  return reputationObj;
};

type UsersStatusListProps = {
  usersStatus: UsersStatus;
  reloadPermanentGraph: any;
  reputationSignal: ReputationSignal[];
  setOpenSideBar: (sidebar: OpenSidebar) => void;
  sx?: SxProps<Theme>;
  onlineUsers: string[];
  usersOnlineStatusLoaded: boolean;
};

const UsersStatusList = (props: UsersStatusListProps) => {
  const [{ user }] = useAuth();
  const db = getFirestore();

  const { onlineUsers, usersOnlineStatusLoaded } = props;

  const [usersDict, setUsersDict] = useState<{ [key: string]: any }>({});
  const [usersDictLoaded, setUsersDictLoaded] = useState(false);
  const [reputationsDict, setReputationsDict] = useState<any>({});
  const [reputationsWeeklyDict, setReputationsWeeklyDict] = useState<any>({});
  const [reputationsMonthlyDict, setReputationsMonthlyDict] = useState<any>({});
  const [reputationsOthersDict, setReputationsOthersDict] = useState<any>({});
  const [reputationsOthersMonthlyDict, setReputationsOthersMonthlyDict] = useState<any>({});
  // flag for whether reputation data is downloaded from server
  const [reputationsLoaded, setReputationsLoaded] = useState(false);
  // flag for whether monthly reputation data is downloaded from server
  const [reputationsMonthlyLoaded, setReputationsMonthlyLoaded] = useState(false);
  // flag for whether weekly reputation data is downloaded from server
  const [reputationsWeeklyLoaded, setReputationsWeeklyLoaded] = useState(false);
  // flag for whether other' reputation data is downloaded from server
  const [reputationsOthersLoaded, setReputationsOthersLoaded] = useState(false);
  // flag for whether other' Monthly reputation data is downloaded from server
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reputationsOthersMonthlyLoaded, setReputationsOthersMonthlyLoaded] = useState(false);

  // const [scaledHeight, setScaledHeight] = useState((window.innerHeight - 430) / scale);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [onlineUsersList, setOnlineUsersList] = useState<any[]>([]);

  // useEffect(() => {
  //   window.onresize = () => setScaledHeight((window.innerHeight - 430) / scale);
  // }, [scale]);

  // useEffect(() => {
  //   const interval = setInterval(() => setTimeNow(Date.now()), 60000);
  //   setScaledHeight((window.innerHeight - 416.4) / scale);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [scale]);

  const loadUserData = useCallback(
    (userId: string) => {
      let singleUserQuery = query(collection(db, "users"), where(documentId(), "==", userId));
      getDocs(singleUserQuery).then(snapshot => {
        if (snapshot.docs.length) {
          let userDoc = snapshot.docs[0];
          let userData = userDoc.data();
          const { fName, lName, createdAt, imageUrl, chooseUname } = userData;
          setUsersDict(prevUserDict => {
            return {
              ...prevUserDict,
              [userId]: {
                createdAt,
                imageUrl,
                fullname: fName + " " + lName,
                chooseUname,
                userId,
              },
            };
          });
        }
      });
    },
    [setUsersDict]
  );

  const dictByReputationType: DictByReputationType = {
    "All Time": setReputationsDict,
    Monthly: setReputationsMonthlyDict,
    Weekly: setReputationsWeeklyDict,
    "Others Votes": setReputationsOthersDict,
    "Others Monthly": setReputationsOthersMonthlyDict,
  };

  useEffect(() => {
    if (props.reputationSignal && props.reputationSignal.length) {
      for (const repType in dictByReputationType) {
        const setRepDict = dictByReputationType[repType as keyof DictByReputationType];
        setRepDict((repDict: any) => {
          for (const signal of props.reputationSignal) {
            if (!signal.type.includes(repType as any)) {
              continue;
            }
            if (!repDict.hasOwnProperty(signal.uname)) {
              repDict[signal.uname] = {
                totalPoints: signal.reputation,
                positives: 0,
                negatives: 0,
              };
            } else {
              repDict[signal.uname].totalPoints += signal.reputation;
            }

            if (signal.reputation > 0) {
              repDict[signal.uname].positives += signal.reputation;
            } else {
              repDict[signal.uname].negatives += Math.abs(signal.reputation);
            }

            if (isNaN(repDict[signal.uname].totalPoints)) {
              repDict[signal.uname].totalPoints = signal.reputation;
            }

            if (isNaN(repDict[signal.uname].positives)) {
              repDict[signal.uname].positives = signal.reputation;
            }

            if (isNaN(repDict[signal.uname].negatives)) {
              repDict[signal.uname].negatives = Math.abs(signal.reputation);
            }
          }
          return { ...repDict };
        });
      }
    }
  }, [props.reputationSignal]);

  // Get user data by tag selected
  useEffect(() => {
    if (!user) return;

    const usersDictTemp: { [key: string]: any } = {};
    const usersQuery = query(collection(db, "users"), where("tagId", "==", user.tagId));
    const usersSnapshot = onSnapshot(usersQuery, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;

      for (let change of docChanges) {
        if (change.type === "added" || change.type === "modified") {
          const userId = change.doc.id;
          const { fName, lName, createdAt, imageUrl, chooseUname, uname } = change.doc.data();
          usersDictTemp[uname] = {
            createdAt,
            imageUrl,
            fullname: fName + " " + lName,
            chooseUname,
            userId,
          };
        }
      }
      setUsersDict(prevUserDict => {
        return { ...prevUserDict, ...usersDictTemp };
      });
      setUsersDictLoaded(true);
    });
    return () => usersSnapshot();
    // }
  }, [db, user]);

  // Load all time reputation after load user
  useEffect(() => {
    if (user?.tagId && usersDictLoaded) {
      loadReputationsData(db, false, "All Time", user.tagId, setReputationsDict, setReputationsLoaded);
    }
  }, [db, user, usersDictLoaded]);

  // Load monthly reputation after load allTime reputation
  useEffect(() => {
    if (user?.tagId && reputationsLoaded) {
      loadReputationsData(db, false, "Monthly", user.tagId, setReputationsMonthlyDict, setReputationsMonthlyLoaded);
    }
  }, [db, reputationsLoaded, user]);

  // Load weekly reputation after load monthly reputation
  useEffect(() => {
    if (user?.tagId && reputationsMonthlyLoaded) {
      loadReputationsData(db, false, "Weekly", user.tagId, setReputationsWeeklyDict, setReputationsWeeklyLoaded);
    }
  }, [db, reputationsMonthlyLoaded, user]);

  // Load others reputation after load weekly reputation
  useEffect(() => {
    if (user?.tagId && reputationsWeeklyLoaded) {
      loadReputationsData(db, false, "Others", user.tagId, setReputationsOthersDict, setReputationsOthersLoaded);
    }
  }, [db, reputationsWeeklyLoaded, user]);

  // load othersMonthly reputation data after load other reputation
  useEffect(() => {
    if (user?.tagId && reputationsOthersLoaded) {
      loadReputationsData(
        db,
        false,
        "Others Monthly",
        user.tagId,
        setReputationsOthersMonthlyDict,
        setReputationsOthersMonthlyLoaded
      );
    }
  }, [db, reputationsOthersLoaded, user]);

  const loadReputationPoints = useCallback(
    (reputationsDict: any, usersStatus: string) => {
      const usersListTmp = [];
      for (let uname in reputationsDict) {
        if (!usersDict.hasOwnProperty(uname)) {
          loadUserData(uname);
        }
      }
      const onlineUsersListTmp = [];
      for (let uname of Object.keys(usersDict)) {
        if (uname in reputationsDict) {
          const user = usersDict[uname];
          const userReputation = reputationsDict[uname];
          const totalPoints =
            userReputation.totalPoints ||
            userReputation.cnCorrects +
              userReputation.cnInst -
              userReputation.cnWrongs +
              userReputation.cdCorrects +
              userReputation.cdInst -
              userReputation.cdWrongs +
              userReputation.qCorrects +
              userReputation.qInst -
              userReputation.qWrongs +
              userReputation.pCorrects +
              userReputation.pInst -
              userReputation.pWrongs +
              userReputation.sCorrects +
              userReputation.sInst -
              userReputation.sWrongs +
              userReputation.aCorrects +
              userReputation.aInst -
              userReputation.aWrongs +
              userReputation.rfCorrects +
              userReputation.rfInst -
              userReputation.rfWrongs +
              userReputation.nCorrects +
              userReputation.nInst -
              userReputation.nWrongs +
              userReputation.mCorrects +
              userReputation.mInst -
              userReputation.mWrongs +
              userReputation.iCorrects +
              userReputation.iInst -
              userReputation.iWrongs +
              userReputation.lterm;
          // only skip small amounts if user status is for all time filter and other filter
          if (((usersStatus !== "All Time" && usersStatus !== "Others Votes") || totalPoints >= 13) && totalPoints) {
            if (onlineUsers.includes(uname)) {
              onlineUsersListTmp.push(usersListObjFromReputationObj(user, userReputation, uname));
            } else {
              usersListTmp.push(usersListObjFromReputationObj(user, userReputation, uname));
            }
          }
        }
      }
      usersListTmp.sort((u1, u2) => u2.totalPoints - u1.totalPoints);
      onlineUsersListTmp.sort((u1, u2) => u2.totalPoints - u1.totalPoints);
      setUsersList(usersListTmp);
      setOnlineUsersList(onlineUsersListTmp);
    },
    [usersDict, onlineUsers]
  );

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "All Time") {
      loadReputationPoints(reputationsDict, props.usersStatus);
    }
  }, [usersOnlineStatusLoaded, reputationsDict, props.usersStatus, loadReputationPoints]);

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "Monthly") {
      loadReputationPoints(reputationsMonthlyDict, props.usersStatus);
    }
  }, [usersOnlineStatusLoaded, reputationsMonthlyDict, props.usersStatus, loadReputationPoints]);

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "Weekly") {
      loadReputationPoints(reputationsWeeklyDict, props.usersStatus);
    }
  }, [usersOnlineStatusLoaded, reputationsWeeklyDict, props.usersStatus, loadReputationPoints]);

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "Others Votes") {
      loadReputationPoints(reputationsOthersDict, props.usersStatus);
    }
  }, [usersOnlineStatusLoaded, reputationsOthersDict, props.usersStatus, loadReputationPoints]);

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "Others Monthly") {
      loadReputationPoints(reputationsOthersMonthlyDict, props.usersStatus);
    }
  }, [usersOnlineStatusLoaded, reputationsOthersMonthlyDict, props.usersStatus, loadReputationPoints]);

  const renderUsersList = useCallback(
    (uList: any[], online: boolean) => {
      return uList.map((user: any) => (
        <MemoizedUserStatusIcon
          key={"User" + user.uname}
          uname={user.uname}
          totalPoints={user.totalPoints}
          totalPositives={user.totalPositives}
          totalNegatives={user.totalNegatives}
          imageUrl={user.imageUrl}
          fullname={user.fullname}
          chooseUname={user.chooseUname}
          online={online}
          inUserBar={false}
          inNodeFooter={false}
          reloadPermanentGrpah={() => console.log("props.reloadPermanentGrpah")}
          tagTitle={user.tag}
          setOpenSideBar={props.setOpenSideBar}
          sx={{ ...props.sx }}
        />
      ));
    },
    [props.setOpenSideBar, props.sx]
  );

  return (
    <Stack
      className="scroll-styled list-tmp"
      direction="column"
      alignItems={"center"} // this value is modified by parent in toolbar sidebar when isMenuOpen
      sx={{
        height: "100%",
        // display: "flex",
        // flexDirection: "column",
        // alignItems: "center",
        overflowY: "auto",
        px: "20px",
      }}
    >
      {renderUsersList(onlineUsersList, true)}
      {renderUsersList(usersList, false)}
    </Stack>
  );
};

export default React.memo(UsersStatusList);
