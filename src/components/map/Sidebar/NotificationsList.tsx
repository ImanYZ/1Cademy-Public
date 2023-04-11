import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import StarIcon from "@mui/icons-material/Star";
import { Box, Button, Checkbox, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
//import { collection, doc, getDocs, getFirestore, increment, limit, query, where, writeBatch } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

// import { useAuth } from "../../../context/AuthContext";
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
  markNotifications: string[];
  setMarkNotifications: any;
};

const NotificationsList = (props: NotificationsListProps) => {
  // const [{ user }] = useAuth();
  // const db = getFirestore();

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

  // const checkNotifications = useCallback(
  //   async (nId: string, value: boolean) => {
  //     if (!user) return;
  //     const notificationRef = doc(db, "notifications", nId);

  //     const batch = writeBatch(db);
  //     batch.update(notificationRef, { checked: value });
  //     const notificationNumsQuery = query(
  //       collection(db, "notificationNums"),
  //       where("uname", "==", user?.uname),
  //       limit(1)
  //     );
  //     const notificationNumsDocs = await getDocs(notificationNumsQuery);
  //     if (notificationNumsDocs.docs.length) {
  //       const notificationNumsRef = doc(db, "notificationNums", notificationNumsDocs.docs[0].id);
  //       const incrementValue = value ? -1 : 1;
  //       batch.update(notificationNumsRef, { nNum: increment(incrementValue) });
  //     }
  //     await batch.commit();
  //   },
  //   [db, user]
  // );

  const markNotification = (event: any, id: string) => {
    if (event.target.checked) {
      props.setMarkNotifications([...props.markNotifications, id]);
    } else {
      const index = props.markNotifications.findIndex(notification => notification === id);
      if (index > -1) {
        props.setMarkNotifications([...props.markNotifications.filter((markId: any) => markId !== id)]);
      }
    }
  };

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

  const renderNotificationTypeIcon = (notification: any) => {
    if (notification.oType === "AccProposal") {
      return (
        <DoneIcon
          className="grey-text"
          fontSize="inherit"
          sx={{
            width: "15px",
            height: "15px",
            color: "#039855",
          }}
        />
      );
    } else if (notification.oType === "Wrong") {
      return (
        <CloseIcon
          className="red-text"
          fontSize="inherit"
          sx={{
            width: "15px",
            height: "15px",
            color: theme => (theme.palette.mode === "dark" ? "#FF8134" : "#FF8134"),
          }}
        />
      );
    } else if (notification.oType === "Propo") {
      return (
        <CreateIcon
          className="red-text"
          fontSize="inherit"
          sx={{
            width: "15px",
            height: "15px",
            color: "#FAC515",
          }}
        />
      );
    } else if (notification.oType === "PropoAccept") {
      return (
        <CreateIcon
          className="red-text"
          fontSize="inherit"
          sx={{
            width: "15px",
            height: "15px",
            color: "#12B76A",
          }}
        />
      );
    } else if (notification.oType === "Node") {
      if (notification.aType === "award") {
        return (
          <StarIcon
            sx={{
              width: "15px",
              height: "15px",
              color: "#FAC515",
            }}
          />
        );
      } else if (notification.aType === "Correct") {
        return (
          <DoneIcon
            className="grey-text"
            fontSize="inherit"
            sx={{
              width: "15px",
              height: "15px",
              color: "#039855",
            }}
          />
        );
      } else if (notification.aType === "Wrong") {
        return (
          <CloseIcon
            className="red-text"
            fontSize="inherit"
            sx={{
              width: "15px",
              height: "15px",
              color: theme => (theme.palette.mode === "dark" ? "#FF8134" : "#FF8134"),
            }}
          />
        );
      }
    }
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
              background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
              listStyle: "none",
              p: "10px 16px 10px 16px",
              fontSize: "16px",
              borderRadius: "8px",
              marginBottom: "8px",
              boxShadow: theme =>
                theme.palette.mode === "light"
                  ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                  : undefined,
              ...(props.markNotifications.includes(notification.id) && {
                background: theme => (theme.palette.mode === "dark" ? "#55402B" : "#FFE2D0"),
              }),
            }}
          >
            <Box className="NotificationBody">
              <Box>
                <Typography sx={{ fontSize: "12px", fontWeight: "500", lineHeight: "16.8px" }}>
                  {notification.oType === "Proposal"
                    ? " Your pending proposal "
                    : notification.oType === "AccProposal"
                    ? " Your proposal was approved "
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
                </Typography>
              </Box>
              <Box
                sx={{
                  marginTop: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
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
                          height: "20px",
                          width: "20px",
                          padding: "4px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: theme => (theme.palette.mode === "dark" ? "#575757" : "#ECECEC"),
                          position: "absolute",
                        }}
                      >
                        {renderNotificationTypeIcon(notification)}
                      </Box>
                      <Typography
                        sx={{ marginLeft: "38px", fontSize: "14px", lineHeight: "19.6px", fontWeight: "500" }}
                      >
                        {notification.title ?? "Notification"}
                      </Typography>
                    </Box>
                  </Button>
                </Tooltip>
                <Tooltip title={`Click to ${props.checked ? "check" : "uncheck"} this notification.`}>
                  <Box
                    sx={{
                      background: props.markNotifications.includes(notification.id) ? "white" : undefined,
                      width: "12px",
                      height: "11px",
                      padding: "0",
                    }}
                  >
                    <Checkbox
                      onChange={e => markNotification(e, notification.id)}
                      defaultChecked={props.checked}
                      checked={props.markNotifications.includes(notification.id)}
                      sx={{
                        color: theme => (theme.palette.mode === "dark" ? "#404040" : "#D0D5DD"),
                        bottom: "15px",
                        left: "-15px",
                        "&.Mui-checked": {
                          color: "#FF6D00",
                        },
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>
              <Box
                className=" Time"
                sx={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: theme => (theme.palette.mode === "dark" ? "#A4A4A4" : "#818181"),
                }}
              >
                {dayjs(notification.createdAt).fromNow()}
              </Box>
            </Box>
          </Paper>
        );
      })}
      {props.notifications.length > lastIndex && <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>}
    </>
  );
};

export default React.memo(NotificationsList);
