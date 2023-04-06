import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import LinkIcon from "@mui/icons-material/Link";
import { Box, Button, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, doc, getDocs, getFirestore, increment, limit, query, where, writeBatch } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { useInView } from "../../../hooks/useObserver";
const NOTIFICATIONS_PER_PAGE = 13;

// CHECK: I comented this unnused variable
// const improvementTypes = [
//   "addedChoices",
//   "deletedChoices",
//   "changedChoices",
//   "changedTitle",
//   "changedContent",
//   "addedImage",
//   "deletedImage",
//   "changedImage",
//   "addedVideo",
//   "deletedVideo",
//   "changedVideo",
//   "addedAudio",
//   "deletedAudio",
//   "changedAudio",
//   "addedReferences",
//   "deletedReferences",
//   "changedReferences",
//   "addedTags",
//   "deletedTags",
//   "changedTags",
//   "addedParents",
//   "addedChildren",
//   "removedParents",
//   "removedChildren",
// ];

dayjs.extend(relativeTime);

type NotificationsListProps = {
  openLinkedNode: any;
  notifications: any;
  checked: boolean;
};

const NotificationsList = (props: NotificationsListProps) => {
  const [{ user }] = useAuth();
  const db = getFirestore();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastIndex, setLastIndex] = useState<number>(NOTIFICATIONS_PER_PAGE);
  const [isRetrieving, setIsRetrieving] = useState(false);

  const { ref: refInfinityLoaderTrigger, inView: inViewInfinityLoaderTrigger } = useInView();

  const loadOlderNotificationsClick = useCallback(() => {
    setIsRetrieving(true);
    setLastIndex(oldLastIndex => {
      if (lastIndex < props.notifications.length) {
        return oldLastIndex + NOTIFICATIONS_PER_PAGE;
      }
      return oldLastIndex;
    });
    setTimeout(() => {
      setIsRetrieving(false);
    }, 500);
  }, [lastIndex, props.notifications.length]);

  useEffect(() => {
    if (!inViewInfinityLoaderTrigger) return;
    if (isRetrieving) return;

    loadOlderNotificationsClick();
  }, [inViewInfinityLoaderTrigger, isRetrieving, loadOlderNotificationsClick]);

  useEffect(() => {
    const displayableNs = [...props.notifications];
    displayableNs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    setNotifications(displayableNs.slice(0, lastIndex));
  }, [lastIndex, props.notifications]);

  const checkNotification = useCallback(
    async (nId: string, value: boolean) => {
      if (!user) return;
      const notificationRef = doc(db, "notifications", nId);

      const batch = writeBatch(db);
      batch.update(notificationRef, { checked: value });
      const notificationNumsQuery = query(
        collection(db, "notificationNums"),
        where("uname", "==", user?.uname),
        limit(1)
      );
      const notificationNumsDocs = await getDocs(notificationNumsQuery);
      if (notificationNumsDocs.docs.length) {
        const notificationNumsRef = doc(db, "notificationNums", notificationNumsDocs.docs[0].id);
        const incrementValue = value ? -1 : 1;
        batch.update(notificationNumsRef, { nNum: increment(incrementValue) });
      }
      await batch.commit();
    },
    [db, user]
  );

  const openLinkedNodeClick = useCallback(
    (notification: any) => notification.aType !== "Delete" && props.openLinkedNode(notification.nodeId),
    [props.openLinkedNode]
  );

  const YOUR_NODE_TEXT = (notification: any) => {
    const notificationTypeMsg = (() => {
      if (notification.aType === "Correct") return "received a Correct mark!";
      if (notification.aType === "CorrectRM") return "lost a Correct mark!";
      if (notification.aType === "Wrong") return "received a Wrong mark!";
      if (notification.aType === "WrongRM") return "lost a Wrong mark!";
      if (notification.aType === "Award") return "received an Award!";
      if (notification.aType === "AwardRM") return "lost an Award!";
      if (notification.aType === "Accept") return "just got accepted!";
      if (notification.aType === "Delete") return "just got deleted!";
      return;
    })();
    if (notificationTypeMsg) {
      return `Your node ${notificationTypeMsg}`;
    }
    return "";
  };

  return (
    <>
      {notifications.map(notification => {
        return (
          <Paper
            elevation={3}
            className="collection-item Notifications"
            key={`Notification${notification.id}`}
            sx={{
              // border: "solid 2px royalBlue",
              background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
              listStyle: "none",
              p: "10px",
              fontSize: "16px",
              boxShadow: theme =>
                theme.palette.mode === "light"
                  ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                  : undefined,
            }}
          >
            <div className="NotificationBody">
              <Box>
                <span style={{ lineHeight: "20px" }}>
                  {notification.oType === "Proposal"
                    ? " Your pending proposal "
                    : notification.oType === "AccProposal"
                    ? " Your accepted proposal "
                    : notification.oType === "Node"
                    ? YOUR_NODE_TEXT(notification)
                    : notification.oType === "Propo"
                    ? " Your node got a proposal for "
                    : notification.oType === "PropoAccept" &&
                      " Your node got an improvement for " +
                        (notification.aType === "newChild"
                          ? "a new Child!"
                          : notification.aType.map((pType: any) => {
                              <p>- {pType.replace(/([a-z])([A-Z])/g, "$1 $2")}</p>;
                            }))}
                </span>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "5px" }}>
                <Tooltip
                  title={
                    notification.aType === "Delete" ? "The node is deleted." : "Click to go to the corresponding node."
                  }
                  placement={"right"}
                >
                  <Button
                    onClick={() => openLinkedNodeClick(notification)}
                    sx={{
                      justifyContent: "stretch",
                      textAlign: "inherit",
                      ":hover": {
                        background: "transparent",
                      },
                    }}
                  >
                    <Box
                      className="NotificationNodeLink"
                      sx={{ display: "flex", alignItems: "center", gap: "5px", paddingY: "10px" }}
                    >
                      <Box
                        sx={{
                          height: "30px",
                          width: "30px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: theme => (theme.palette.mode === "dark" ? "#575757" : "#ECECEC"),
                          position: "absolute",
                        }}
                      >
                        <LinkIcon
                          className="grey-text"
                          fontSize="inherit"
                          sx={{
                            color: theme => (theme.palette.mode === "dark" ? "#FF8134" : "#FF8134"),
                          }}
                        />
                      </Box>
                      <Typography sx={{ marginLeft: "38px", fontWeight: "500" }}>
                        {notification.title ?? "Notification"}
                      </Typography>
                    </Box>
                  </Button>
                </Tooltip>
                <Tooltip title={`Click to ${props.checked ? "check" : "uncheck"} this notification.`}>
                  <IconButton onClick={() => checkNotification(notification.id, !props.checked)}>
                    {props.checked ? (
                      <CheckBoxIcon />
                    ) : (
                      <CheckBoxOutlineBlankIcon
                        sx={{
                          color: theme => (theme.palette.mode === "dark" ? "#C5CBD5" : "#C5CBD5"),
                        }}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                className=" Time"
                sx={{ fontSize: "12px", color: theme => (theme.palette.mode === "dark" ? "#A4A4A4" : "#818181") }}
              >
                {dayjs(notification.createdAt).fromNow()}
              </Box>
            </div>
          </Paper>
        );
      })}
      {props.notifications.length > lastIndex && <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>}
    </>
  );
};

export default React.memo(NotificationsList);
