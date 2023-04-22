import { Box, Tab, Tabs, Typography } from "@mui/material";
import { collection, DocumentData, getFirestore, onSnapshot, Query, query, where } from "firebase/firestore";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";

import { RiveComponentMemoized } from "@/components/home/components/temporals/RiveComponentExtended";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { CustomBadge } from "../../CustomBudge";
import NotificationsList from "../NotificationsList";
import { SidebarWrapper } from "./SidebarWrapper";

type NotificationSidebarProps = {
  open: boolean;
  onClose: () => void;
  openLinkedNode: any;
  username: string;
  sidebarWidth: number;
  innerHeight?: number;
};
export type Notification = {
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

type NotificationTabs = {
  title: string;
  content: ReactNode;
  badge?: ReactElement;
};

const NotificationSidebar = ({
  open,
  onClose,
  openLinkedNode,
  username,
  sidebarWidth,
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const contentSignalState = useMemo(() => {
    return [...uncheckedNotifications];
  }, [checkedNotifications, uncheckedNotifications, value]);

  const tabItems = useMemo<NotificationTabs[]>(() => {
    return [
      {
        title: "Unread",
        content: (
          <>
            {uncheckedNotifications.length > 0 ? (
              <NotificationsList
                notifications={uncheckedNotifications}
                openLinkedNode={openLinkedNode}
                checked={false}
              />
            ) : (
              <NotFoundNotification />
            )}
          </>
        ),
        badge: (
          <>
            {uncheckedNotifications.length > 0 ? (
              <CustomBadge value={uncheckedNotifications.length} sx={{ ml: "4px" }} />
            ) : null}
          </>
        ),
      },
      {
        title: "Read",
        content: (
          <>
            {checkedNotifications.length > 0 ? (
              <NotificationsList notifications={checkedNotifications} openLinkedNode={openLinkedNode} checked={true} />
            ) : (
              <NotFoundNotification />
            )}
          </>
        ),
      },
    ];
  }, [checkedNotifications, openLinkedNode, uncheckedNotifications]);

  return (
    <SidebarWrapper
      open={open}
      title="Notifications"
      width={sidebarWidth}
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
          <Tabs value={value} onChange={handleChange} aria-label={"Notification Tabs"} variant="fullWidth">
            {tabItems.map((tabItem, idx: number) => (
              <Tab
                key={tabItem.title}
                id={`notifications-tab-${tabItem.title.toLowerCase()}`}
                label={tabItem.title}
                {...a11yProps(idx)}
                sx={{ py: "16px" }}
                icon={tabItem.badge || <></>}
                iconPosition="end"
              />
            ))}
          </Tabs>
        </Box>
      }
      contentSignalState={contentSignalState}
      SidebarContent={open ? <Box sx={{ height: "100%", py: "10px" }}>{tabItems[value].content}</Box> : null}
    />
  );
};

const NotFoundNotification = () => {
  return (
    <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
      <Box>
        <Box sx={{ width: { xs: "250px", sm: "300px" }, height: { xs: "150px", sm: "200px" } }}>
          <RiveComponentMemoized
            src="./rive-notebook/notification.riv"
            animations={"Timeline 1"}
            artboard="New Artboard"
            autoplay={true}
          />
        </Box>
        <Typography fontWeight={"500"} fontSize={"18px"} textAlign={"center"} maxWidth={"300px"}>
          You've not checked off any notifications
        </Typography>
        <Typography
          fontSize={"12px"}
          textAlign={"center"}
          maxWidth={"300px"}
          sx={{
            color: ({ palette: { mode } }) =>
              mode === "dark" ? DESIGN_SYSTEM_COLORS.gray50 : DESIGN_SYSTEM_COLORS.gray700,
          }}
        >
          If you mark your notifications as read, they'll show up in this list.{" "}
        </Typography>
      </Box>
    </Box>
  );
};
export const MemoizedNotificationSidebar = React.memo(NotificationSidebar);
