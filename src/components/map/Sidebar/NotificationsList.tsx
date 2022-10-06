import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditIcon from "@mui/icons-material/Edit";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, IconButton } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { doc, getFirestore, writeBatch } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
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
      // const notificationNumsRef = doc(db, "notificationNums", user.uname);
      // // const notificationNumsRef = firebase.db.collection("notificationNums").doc(username);

      // const nNum = value ? firestore.FieldValue.increment(1) : firestore.FieldValue.increment(-1);
      // // let nNum = firestore.FieldValue.increment(1);
      // // if (!value) {
      // //   nNum = firebase.firestore.FieldValue.increment(-1);
      // // }
      // batch.update(notificationNumsRef, { nNum });
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

  const loadOlderNotificationsClick = useCallback(
    () =>
      setLastIndex(oldLastIndex => {
        if (lastIndex < props.notifications.length) {
          return oldLastIndex + NOTIFICATIONS_PER_PAGE;
        }
        return oldLastIndex;
      }),
    [lastIndex, props.notifications.length]
  );
  return (
    <>
      {notifications.map(notification => {
        return (
          <li
            className="collection-item Notifications"
            key={`Notification${notification.id}`}
            style={{
              // border: "solid 2px royalBlue",
              listStyle: "none",
              padding: "2px 10px",
              borderBottom: "solid 1px white",
              fontSize: "16px",
              // display: "flex",
              // alignItems: "flex-end",
            }}
            // onClick={event => {
            //   selectMessage(event, message.node);
            // }}
          >
            {/* <div className="title Username">{notification.uname}</div>
                <div className="NotificationUserAvatar">
                  <UserHeader imageUrl={notification.imageUrl} />
                </div> */}
            <div className="NotificationBody">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <span className="NotificationAction" style={{ fontSize: "20px" }}>
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
                </span>
                <span className="NotificationObject" style={{ justifySelf: "start" }}>
                  {notification.oType === "Proposal"
                    ? " Your pending proposal "
                    : notification.oType === "AccProposal"
                    ? " Your accepted proposal "
                    : notification.oType === "Node"
                    ? " Your node " +
                      (notification.aType === "Correct"
                        ? "received a Correct mark!"
                        : notification.aType === "CorrectRM"
                        ? "lost a Correct mark!"
                        : notification.aType === "Wrong"
                        ? "received a Wrong mark!"
                        : notification.aType === "WrongRM"
                        ? "lost a Wrong mark!"
                        : notification.aType === "Award"
                        ? "received an Award!"
                        : notification.aType === "AwardRM"
                        ? "lost an Award!"
                        : notification.aType === "Accept" && "just got accepted!")
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
                <Box className="title Time" sx={{ fontSize: "12px" }}>
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
                    sx={{ display: "flex", alignItems: "center", gap: "5px", padding: "10px" }}
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
          </li>
        );
      })}
      {props.notifications.length > lastIndex && (
        <div id="ContinueButton">
          <MemoizedMetaButton
            onClick={loadOlderNotificationsClick}
            // tooltip={"Load older " + (props.checked ? "read" : "unread") + " notifications."}
            // tooltipPosition="Right"
          >
            <>
              <ExpandMoreIcon className="grey-text" />
              Older Notifications
              <ExpandMoreIcon className="grey-text" />
            </>
          </MemoizedMetaButton>
        </div>
      )}
    </>
  );
};

export default React.memo(NotificationsList);
