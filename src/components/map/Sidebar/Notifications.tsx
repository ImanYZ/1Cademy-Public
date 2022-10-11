import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Box } from "@mui/system";
import {
  collection,
  doc,
  DocumentData,
  getDocs,
  getFirestore,
  onSnapshot,
  Query,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
// import "./Notifications.css";
import React, { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { MemoizedMetaButton } from "../MetaButton";
import { MemoizedSidebarTabs } from "../SidebarTabs/SidebarTabs";
import NotificationsList from "./NotificationsList";
// import { useRecoilValue } from "recoil";

// import { firebaseState, usernameState } from "../../../../../store/AuthAtoms";
// import MetaButton from "../../../MetaButton/MetaButton";
// import SidebarTabs from "../../SidebarTabs/SidebarTabs";
// import NotificationsList from "../NotificationsList/NotificationsList";

type Notification = {
  id: string;
  aType: string;
  createdAt: Date;
  imageUrl: string;
  fullname: string;
  chooseUname: false;
  nodeId: string;
  title: string;
  oType: string;
  uname: string;
};

type NotificationsProps = {
  openLinkedNode: any;
};

const Notifications = (props: NotificationsProps) => {
  const [{ user }] = useAuth();
  const db = getFirestore();
  // const firebase = useRecoilValue(firebaseState);
  // const username = useRecoilValue(usernameState);

  const [checkedNotifications, setCheckedNotifications] = useState<Notification[]>([]);
  const [uncheckedNotifications, setUncheckedNotifications] = useState<Notification[]>([]);

  const snapshot = useCallback((q: Query<DocumentData>) => {
    const notificationsSnapshot = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return null;

      // const checkedNotificationsDict: any = checkedNotifications.reduce((acu, cur) => {
      //   return { ...acu, [cur.id]: cur };
      // }, {});

      // const uncheckedNotificationsDict: any = uncheckedNotifications.reduce((acu, cur) => {
      //   return { ...acu, [cur.id]: cur };
      // }, {});
      // debugger;

      const checkedNotificationsDict: any = {};
      const uncheckedNotificationsDict: any = {};

      for (let change of docChanges) {
        const notificationId = change.doc.id;
        const { aType, checked, createdAt, imageUrl, fullname, chooseUname, nodeId, title, oType, uname } =
          change.doc.data();
        if (change.type === "removed") {
          if (checked) {
            delete checkedNotificationsDict[notificationId];
          } else {
            delete uncheckedNotificationsDict[notificationId];
          }
        }
        if (change.type === "added" || change.type === "modified") {
          if (checked) {
            // will add in checkedNotificationsDict
            checkedNotificationsDict[notificationId] = {
              aType,
              createdAt: createdAt.toDate(),
              imageUrl,
              fullname,
              chooseUname,
              nodeId,
              title,
              oType,
              uname,
            };
            if (notificationId in uncheckedNotificationsDict) {
              delete uncheckedNotificationsDict[notificationId];
            }
          } else {
            // will add in uncheckedNotificationsDict
            uncheckedNotificationsDict[notificationId] = {
              aType,
              createdAt: createdAt.toDate(),
              imageUrl,
              fullname,
              chooseUname,
              nodeId,
              title,
              oType,
              uname,
            };
            if (notificationId in checkedNotificationsDict) {
              delete checkedNotificationsDict[notificationId];
            }
          }
        }
      }
      const checkedNotificationsTemp: Notification[] = [];
      for (let notificationId in checkedNotificationsDict) {
        checkedNotificationsTemp.push({
          id: notificationId,
          ...checkedNotificationsDict[notificationId],
        });
      }
      checkedNotificationsTemp.sort((n1, n2) => (n1.createdAt < n2.createdAt ? 1 : -1));

      const uncheckedNotificationsTemp: Notification[] = [];
      for (let notificationId in uncheckedNotificationsDict) {
        uncheckedNotificationsTemp.push({
          id: notificationId,
          ...uncheckedNotificationsDict[notificationId],
        });
      }
      uncheckedNotificationsTemp.sort((n1, n2) => (n1.createdAt < n2.createdAt ? 1 : -1));

      setCheckedNotifications(oldCheckedNotifications => {
        const validValues = oldCheckedNotifications.filter(
          cur => !uncheckedNotificationsTemp.some(c => c.id === cur.id)
        );
        const newValues = checkedNotificationsTemp;
        return [...validValues, ...newValues].sort((n1, n2) => (n1.createdAt < n2.createdAt ? 1 : -1));
      });
      // setCheckedNotifications([...checkedNotificationsTemp]);
      // setUncheckedNotifications([...uncheckedNotificationsTemp]);
      setUncheckedNotifications(oldUncheckedNotifications => {
        const validValues = oldUncheckedNotifications.filter(
          cur => !checkedNotificationsTemp.some(c => c.id === cur.id)
        );
        const newValues = uncheckedNotificationsTemp;
        return [...validValues, ...newValues].sort((n1, n2) => (n1.createdAt < n2.createdAt ? 1 : -1));
      });
    });
    return () => notificationsSnapshot();
  }, []);

  useEffect(() => {
    if (!db) return;
    if (!user) return;

    console.log("In username, mapRendered useEffect");

    const ref = collection(db, "notifications");
    const q = query(ref, where("proposer", "==", user.uname));

    const killSnapshot = snapshot(q);
    return () => killSnapshot();
  }, [db, snapshot, user]);

  const checkAllNotification = useCallback(async () => {
    if (!user) return;

    const batch = writeBatch(db);
    const q = query(collection(db, "notifications"), where("proposer", "==", user.uname));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(notificationDoc => {
      const notificationRef = doc(db, "notifications", notificationDoc.id);
      batch.update(notificationRef, { checked: true });
      // doc.data() is never undefined for query doc snapshots
      // console.log(notificationDoc.id, " => ", notificationDoc.data());
    });

    // update notifications nums

    const notificationNumsRef = doc(db, "notificationNums", user.uname);
    batch.update(notificationNumsRef, { nNum: 0 });
    await batch.commit();

    // TODO: Important set notificationNums to 0

    // // const notificationDocs = await firebase.db.collection("notifications").where("proposer", "==", username).get();

    // const notificationRef = doc(db, "notifications");

    // for (let notificationDoc of notificationsDocs.docs) {
    //   const notificationRef = firebase.db.collection("notifications").doc(notificationDoc.id);
    //   await firebase.batchUpdate(notificationRef, { checked: true });
    // }
    // const notificationNumsRef = firebase.db.collection("notificationNums").doc(username);
    // await firebase.batchUpdate(notificationNumsRef, { nNum: 0 });
    // await firebase.commitBatch();
  }, [db, user]);

  const tabsItems = [
    {
      title: "Unread",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {!uncheckedNotifications.length && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h3>You don't have notifications</h3>
            </Box>
          )}
          {uncheckedNotifications.length > 0 && (
            <>
              <div id="MarkAllRead">
                <MemoizedMetaButton onClick={() => checkAllNotification()}>
                  <div id="MarkAllReadButton">
                    {/* <i className="material-icons DoneIcon green-text">done_all</i> */}
                    <DoneAllIcon className="material-icons DoneIcon green-text" />
                    <span>Mark All Read</span>
                  </div>
                </MemoizedMetaButton>
              </div>
              <NotificationsList
                notifications={uncheckedNotifications}
                openLinkedNode={props.openLinkedNode}
                checked={false}
              />
            </>
          )}
        </Box>
      ),
    },
    {
      title: "Read",
      content: (
        <Box>
          {!checkedNotifications.length && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h3>You don't have notifications</h3>
            </Box>
          )}
          {checkedNotifications.length > 0 && (
            <NotificationsList
              notifications={checkedNotifications}
              openLinkedNode={props.openLinkedNode}
              checked={true}
            />
          )}
        </Box>
      ),
    },
  ];

  return <MemoizedSidebarTabs tabsTitle="Notifications tabs" tabsItems={tabsItems} />;
};

export default React.memo(Notifications);
