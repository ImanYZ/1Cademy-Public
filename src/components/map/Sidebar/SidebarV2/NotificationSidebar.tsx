import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Box, Tab, Tabs } from "@mui/material";
import {
  collection,
  doc,
  DocumentData,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  Query,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import notificationsDarkTheme from "../../../../../public/notifications-dark-theme.jpg";
import notificationsLightTheme from "../../../../../public/notifications-light-theme.jpg";
import { MemoizedMetaButton } from "../../MetaButton";
import NotificationsList from "../NotificationsList";
import { SidebarWrapper } from "./SidebarWrapper";

type NotificationSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  innerHeight?: number;
};
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

const NotificationSidebar = ({
  open,
  onClose,
  theme,
  openLinkedNode,
  username,
  innerHeight,
}: NotificationSidebarProps) => {
  const [value, setValue] = React.useState(0);
  const [checkedNotifications, setCheckedNotifications] = useState<Notification[]>([]);
  const [uncheckedNotifications, setUncheckedNotifications] = useState<Notification[]>([]);

  const db = getFirestore();

  const snapshot = useCallback((q: Query<DocumentData>) => {
    const notificationsSnapshot = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return null;

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
    if (!username) return;

    const ref = collection(db, "notifications");
    const q = query(ref, where("proposer", "==", username));

    const killSnapshot = snapshot(q);
    return () => {
      setCheckedNotifications([]);
      setUncheckedNotifications([]);
      killSnapshot();
    };
  }, [db, snapshot, username]);

  const checkAllNotification = useCallback(async () => {
    if (!username) return;
    const batch = writeBatch(db);
    const q = query(collection(db, "notifications"), where("proposer", "==", username));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(notificationDoc => {
      const notificationRef = doc(db, "notifications", notificationDoc.id);
      batch.update(notificationRef, { checked: true });
    });

    const notificationNumsQuery = query(collection(db, "notificationNums"), where("uname", "==", username), limit(1));
    const notificationNumsDocs = await getDocs(notificationNumsQuery);
    if (notificationNumsDocs.docs.length) {
      const notificationNumsRef = doc(db, "notificationNums", notificationNumsDocs.docs[0].id);
      batch.update(notificationNumsRef, { nNum: 0 });
    }
    await batch.commit();
  }, [db, username]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const contentSignalState = useMemo(() => {
    return [...uncheckedNotifications];
  }, [checkedNotifications, uncheckedNotifications, value]);

  return (
    <SidebarWrapper
      open={open}
      title="Notifications"
      headerImage={theme === "Dark" ? notificationsDarkTheme : notificationsLightTheme}
      width={window.innerWidth > 899 ? 430 : window.innerWidth}
      height={window.innerWidth > 899 ? 100 : 35}
      innerHeight={innerHeight}
      // anchor="right"
      onClose={onClose}
      SidebarOptions={
        <Box
          sx={{
            borderBottom: 1,
            borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
            width: "100%",
          }}
        >
          <Tabs value={value} onChange={handleChange} aria-label={"Notification Tabs"}>
            {[{ title: "Unread" }, { title: "Read" }].map((tabItem: any, idx: number) => (
              <Tab key={tabItem.title} label={tabItem.title} {...a11yProps(idx)} />
            ))}
          </Tabs>
        </Box>
      }
      contentSignalState={contentSignalState}
      SidebarContent={
        <Box sx={{ display: "flex", flexDirection: "column", p: "10px" }}>
          {((!uncheckedNotifications.length && value === 0) || (!checkedNotifications.length && value === 1)) && (
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
          {uncheckedNotifications.length > 0 && value === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
                openLinkedNode={openLinkedNode}
                checked={false}
              />
            </Box>
          )}
          {checkedNotifications.length > 0 && value === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <NotificationsList notifications={checkedNotifications} openLinkedNode={openLinkedNode} checked={true} />
            </Box>
          )}
        </Box>
      }
    ></SidebarWrapper>
  );
};
export const MemoizedNotificationSidebar = React.memo(NotificationSidebar, (prev, next) => {
  return prev.theme === next.theme && prev.username === next.username && prev.open === next.open;
});
