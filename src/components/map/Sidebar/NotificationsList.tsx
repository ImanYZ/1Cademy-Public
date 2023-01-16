import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditIcon from "@mui/icons-material/Edit";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LinkIcon from "@mui/icons-material/Link";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, IconButton, Paper } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, doc, getDocs, getFirestore, increment, limit, query, where, writeBatch } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { useInView } from "../../../hooks/useObserver";
import { Editor } from "../../Editor";
import { MemoizedMetaButton } from "../MetaButton";

const NOTIFICATIONS_PER_PAGE = 13;

const doNothing = () => {};

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
      // update checked value from notifications
      const notificationRef = doc(db, "notifications", nId);
      // const notificationRef = firebase.db.collection("notifications").doc(nId);
      const batch = writeBatch(db);
      batch.update(notificationRef, { checked: value });
      // await firebase.batchUpdate(notificationRef, { checked: value });

      // // update notificationNums
      const notificationNumsQuery = query(
        collection(db, "notificationNums"),
        where("uname", "==", user?.uname),
        limit(1)
      );
      const notificationNumsDocs = await getDocs(notificationNumsQuery);
      if (notificationNumsDocs.docs.length) {
        const notificationNumsRef = doc(db, "notificationNums", notificationNumsDocs.docs[0].id);
        // const nNum = value ? increment(1) : increment(-1);
        const incrementValue = value ? -1 : 1;
        // // let nNum = firestore.FieldValue.increment(1);
        // // if (!value) {
        // //   nNum = firebase.firestore.FieldValue.increment(-1);
        // // }
        batch.update(notificationNumsRef, { nNum: increment(incrementValue) });
      }
      // // const notificationNumsRef = firebase.db.collection("notificationNums").doc(username);

      // // await firebase.batchUpdate(notificationNumsRef, { nNum });
      // // await firebase.commitBatch();

      // TODO: Important update notificationNumsRef
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
              listStyle: "none",
              px: "10px",
              fontSize: "16px",
            }}
          >
            <div className="NotificationBody">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "20px 1fr 72px",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                <Box component="span" className="NotificationAction" style={{ fontSize: "20px", width: "20px" }}>
                  {notification.oType === "Propo" ? (
                    <EditIcon className="amber-text" fontSize="inherit" />
                  ) : notification.oType === "PropoAccept" ? (
                    <EditIcon className="DoneIcon green-text" fontSize="inherit" />
                  ) : notification.aType === "Correct" ? (
                    <DoneIcon className="DoneIcon green-text" fontSize="inherit" />
                  ) : notification.aType === "CorrectRM" ? (
                    <DoneIcon className="DoneIcon green-text Striked" fontSize="inherit" />
                  ) : notification.aType === "Wrong" ? (
                    <CloseIcon className="red-text" fontSize="inherit" />
                  ) : notification.aType === "WrongRM" ? (
                    <CloseIcon className="red-text Striked" fontSize="inherit" />
                  ) : notification.aType === "Award" ? (
                    <EmojiEventsIcon className="amber-text" fontSize="inherit" />
                  ) : notification.aType === "AwardRM" ? (
                    <EmojiEventsIcon className="amber-text Striked" fontSize="inherit" />
                  ) : notification.aType === "Accepted" ? (
                    <DoneAllIcon className="amber-text" fontSize="inherit" />
                  ) : (
                    notification.aType === "Delete" && <DeleteForeverIcon className="red-text" />
                  )}
                </Box>
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

                <Box className="title Time" sx={{ fontSize: "12px", justifySelf: "right" }}>
                  {dayjs(notification.createdAt).fromNow()}
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "5px" }}>
                <MemoizedMetaButton
                  onClick={() => openLinkedNodeClick(notification)}
                  // tooltip={
                  //   notification.aType === "Delete"
                  //     ? "The node is deleted."
                  //     : "Click to go to the corresponding node."
                  // }
                  // tooltipPosition="Right"
                >
                  <Box
                    className="NotificationNodeLink"
                    sx={{ display: "flex", alignItems: "center", gap: "5px", paddingY: "10px" }}
                  >
                    <LinkIcon className="grey-text" fontSize="inherit" />
                    <Editor
                      value={notification.title ?? "Notification"}
                      readOnly={true}
                      setValue={doNothing}
                      label=""
                    />
                  </Box>
                </MemoizedMetaButton>
                <IconButton
                  onClick={() => checkNotification(notification.id, !props.checked)}
                  // tooltip={
                  //   "Click to " +
                  //   (props.checked ? "check" : "uncheck") +
                  //   " this notification."
                  // }
                  // tooltipPosition="Right"
                >
                  {/* <i className={(!props.checked && "DoneIcon") + " grey-text"}>

                </i> */}
                  {props.checked ? <CheckCircleOutlineIcon /> : <RadioButtonUncheckedIcon />}
                </IconButton>
              </Box>
            </div>
          </Paper>
        );
      })}
      {props.notifications.length > lastIndex && (
        <Box id="ContinueButton" ref={refInfinityLoaderTrigger} sx={{ background: "red" }}>
          {/* <MemoizedMetaButton
            onClick={loadOlderNotificationsClick}
            // tooltip={"Load older " + (props.checked ? "read" : "unread") + " notifications."}
            // tooltipPosition="Right"
          >
            <>
              <ExpandMoreIcon className="grey-text" />
              Older Notifications
              <ExpandMoreIcon className="grey-text" />
            </>
          </MemoizedMetaButton> */}
        </Box>
      )}
    </>
  );
};

export default React.memo(NotificationsList);
