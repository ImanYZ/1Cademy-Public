import { Box } from "@mui/material";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { loadReputationsData } from "../../../lib/utils/Map.utils";
import { UsersStatus } from "../../../nodeBookTypes";
// import { UsersStatus } from "../../../noteBookTypes";
import { MemoizedUserStatusIcon } from "../UserStatusIcon";

// const scale = 1;

const usersListObjFromReputationObj = (user: any, userReputation: any, uname: string) => {
  return {
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
};

type UsersStatusListProps = {
  usersStatus: UsersStatus;
  reloadPermanentGraph: any;
};

const UsersStatusList = (props: UsersStatusListProps) => {
  const [{ user }] = useAuth();
  const db = getFirestore();

  const [usersDict, setUsersDict] = useState<{ [key: string]: any }>({});
  const [usersDictLoaded, setUsersDictLoaded] = useState(false);
  const [reputationsDict, setReputationsDict] = useState({});
  const [reputationsWeeklyDict, setReputationsWeeklyDict] = useState({});
  const [reputationsMonthlyDict, setReputationsMonthlyDict] = useState({});
  const [reputationsOthersDict, setReputationsOthersDict] = useState({});
  const [reputationsOthersMonthlyDict, setReputationsOthersMonthlyDict] = useState({});
  // flag for whether reputation data is downloaded from server
  const [reputationsLoaded, setReputationsLoaded] = useState(false);
  // flag for whether monthly reputation data is downloaded from server
  const [reputationsMonthlyLoaded, setReputationsMonthlyLoaded] = useState(false);
  // flag for whether weekly reputation data is downloaded from server
  const [reputationsWeeklyLoaded, setReputationsWeeklyLoaded] = useState(false);
  // flag for whether other' reputation data is downloaded from server
  const [reputationsOthersLoaded, setReputationsOthersLoaded] = useState(false);
  // flag for whether other' Monthly reputation data is downloaded from server
  const [reputationsOthersMonthlyLoaded, setReputationsOthersMonthlyLoaded] = useState(false);

  // const [scaledHeight, setScaledHeight] = useState((window.innerHeight - 430) / scale);
  const [usersOnlineStatusLoaded, setUsersOnlineStatusLoaded] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
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
      setUsersDict({ ...usersDictTemp });
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

  // Load onlineUser after load otherMonthly reputation
  useEffect(() => {
    // console.log("In reputationsOthersMonthlyLoaded useEffect");
    if (reputationsOthersMonthlyLoaded) {
      const usersStatusQuery = query(collection(db, "status"), where("state", "==", "online"));
      // const usersStatusQuery = firebase.db.collection("status").where("state", "==", "online");

      const usersStatusSnapshot = onSnapshot(usersStatusQuery, snapshot => {
        const docChanges = snapshot.docChanges();
        if (docChanges.length > 0) {
          setOnlineUsers(oOnlineUsers => {
            const onlineUsersSet = new Set(oOnlineUsers);
            for (let change of docChanges) {
              const { user } = change.doc.data();
              if (change.type === "removed") {
                onlineUsersSet.delete(user);
              } else if (change.type === "added" || change.type === "modified") {
                onlineUsersSet.add(user);
              }
            }
            // return [...onlineUsersSet];
            return Array.from(onlineUsersSet);
          });
        }
        setUsersOnlineStatusLoaded(true);
      });
      return () => usersStatusSnapshot();
    }
  }, [db, reputationsOthersMonthlyLoaded]);

  const loadReputationPoints = useCallback(
    (reputationsDict: any) => {
      const usersListTmp = [];
      const onlineUsersListTmp = [];
      for (let uname of Object.keys(usersDict)) {
        if (uname in reputationsDict) {
          const user = usersDict[uname];
          const userReputation = reputationsDict[uname];
          if (
            ("totalPoints" in userReputation && userReputation.totalPoints >= 13) ||
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
              userReputation.lterm >=
              13
          ) {
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
      loadReputationPoints(reputationsDict);
    }
  }, [usersOnlineStatusLoaded, reputationsDict, props.usersStatus, loadReputationPoints]);

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "Monthly") {
      loadReputationPoints(reputationsMonthlyDict);
    }
  }, [usersOnlineStatusLoaded, reputationsMonthlyDict, props.usersStatus, loadReputationPoints]);

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "Weekly") {
      loadReputationPoints(reputationsWeeklyDict);
    }
  }, [usersOnlineStatusLoaded, reputationsWeeklyDict, props.usersStatus, loadReputationPoints]);

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "Others Votes") {
      loadReputationPoints(reputationsOthersDict);
    }
  }, [usersOnlineStatusLoaded, reputationsOthersDict, props.usersStatus, loadReputationPoints]);

  useEffect(() => {
    if (usersOnlineStatusLoaded && props.usersStatus === "Others Monthly") {
      loadReputationPoints(reputationsOthersMonthlyDict);
    }
  }, [usersOnlineStatusLoaded, reputationsOthersMonthlyDict, props.usersStatus, loadReputationPoints]);

  const renderUsersList = useCallback((uList: any[], online: boolean) => {
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
      />
    ));
  }, []);

  return (
    <Box
      // id="UsersStatusList"
      className="scroll-styled"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        px: "10px",
        // width: "80px",
      }}
    >
      {renderUsersList(onlineUsersList, true)}
      {renderUsersList(usersList, false)}
    </Box>
  );
};

export default React.memo(UsersStatusList);
