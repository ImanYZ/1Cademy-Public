import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import { Box, Checkbox, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, doc, getDocs, getFirestore, increment, limit, query, where, writeBatch } from "firebase/firestore";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

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
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
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

  const handleSelectNotification = (event: ChangeEvent<HTMLInputElement>, notificationId: string) => {
    setSelectedNotifications(prev => {
      let sNotifications = [...prev];
      if (event.target.checked === true) {
        sNotifications.push(notificationId);
      } else {
        sNotifications = sNotifications.filter(notification => notification !== notificationId);
      }
      return sNotifications;
    });
  };
  const onReadNotifications = useCallback(async () => {
    if (selectedNotifications.length <= 0) return;

    const batch = writeBatch(db);
    for (const notificationId of selectedNotifications) {
      const notificationRef = doc(db, "notifications", notificationId);
      batch.update(notificationRef, { checked: !props.checked });
    }
    const notificationNumsQuery = query(
      collection(db, "notificationNums"),
      where("uname", "==", user?.uname),
      limit(1)
    );
    const notificationNumsDocs = await getDocs(notificationNumsQuery);
    if (notificationNumsDocs.docs.length) {
      const notificationNumsRef = doc(db, "notificationNums", notificationNumsDocs.docs[0].id);
      const incrementValue = !props.checked ? -selectedNotifications.length : selectedNotifications.length;
      batch.update(notificationNumsRef, { nNum: increment(incrementValue) });
    }
    await batch.commit();
  }, [db, props.checked, selectedNotifications, user?.uname]);

  // const openLinkedNodeClick = useCallback(
  //   (notification: any) => notification.aType !== "Delete" && props.openLinkedNode(notification.nodeId),
  //   [props.openLinkedNode]
  // );

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
  console.log({ notifications });
  return (
    <Box>
      <Stack direction={"row"} spacing={"12px"}>
        <Tooltip title={"Select all"}>
          <IconButton onClick={onReadNotifications}>
            <IndeterminateCheckBoxOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={"Mark as read"}>
          <IconButton onClick={onReadNotifications}>
            <DraftsOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack spacing={"8px"}>
        {notifications.map(notification => {
          return (
            <Paper
              elevation={3}
              key={`Notification${notification.id}`}
              sx={{
                display: "flex",

                listStyle: "none",
                p: "10px 16px",
                borderRadius: "8px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
              }}
            >
              <Box flex={1}>
                <Typography fontSize={"12px"} fontWeight={"500"} mb="10px">
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
                </Typography>

                <Stack direction={"row"} alignItems={"center"} spacing={"8px"} mb="10px">
                  <NotificationTypeIcon notification={notification} />
                  <Typography fontSize={"14px"} fontWeight={"500"}>
                    {notification.title ?? "Notification"}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: theme =>
                      theme.palette.mode === "dark"
                        ? DESIGN_SYSTEM_COLORS.notebookG200
                        : DESIGN_SYSTEM_COLORS.notebookG300,
                  }}
                >
                  {dayjs(notification.createdAt).fromNow()}
                </Typography>
              </Box>
              <Box sx={{ display: "f  lex", justifyContent: "space-between", alignItems: "center", gap: "5px" }}>
                {/* <Tooltip title={`Click to ${props.checked ? "check" : "uncheck"} this notification.`}>
                <IconButton onClick={() => checkNotification(notification.id, !props.checked)}>
                  {props.checked ? <CheckCircleOutlineIcon /> : <RadioButtonUncheckedIcon />}
                </IconButton>
              </Tooltip> */}
                <Checkbox
                  onChange={event => handleSelectNotification(event, notification.id)}
                  sx={{
                    "&.Mui-checked": {
                      color: DESIGN_SYSTEM_COLORS.primary800,
                      background: "radial-gradient(circle, #fff 30%, transparent 30%)",
                    },
                  }}
                />
              </Box>
            </Paper>
          );
        })}
      </Stack>
      {props.notifications.length > lastIndex && <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>}
    </Box>
  );
};

const NotificationTypeIcon = ({ notification }: { notification: any }) => {
  if (!notification) return null;
  return (
    <Box
      component="span"
      sx={{
        display: "grid",
        placeItems: "center",
        alignSelf: "center",
        p: "7px",
        borderRadius: "50%",
        backgroundColor: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.notebookG50,
      }}
    >
      {notification.oType === "Propo" ? (
        <EditRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.yellow400 }} fontSize="inherit" />
      ) : notification.oType === "PropoAccept" ? (
        <EditRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.success600 }} fontSize="inherit" />
      ) : notification.aType === "Correct" ? (
        <DoneRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.success600 }} fontSize="inherit" />
      ) : notification.aType === "CorrectRM" ? (
        <DoneRoundedIcon
          sx={{ color: DESIGN_SYSTEM_COLORS.success600, textDecoration: "line-through" }}
          fontSize="inherit"
        />
      ) : notification.aType === "Wrong" ? (
        <CloseRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange700 }} fontSize="inherit" />
      ) : notification.aType === "WrongRM" ? (
        <CloseRoundedIcon
          sx={{ color: DESIGN_SYSTEM_COLORS.orange700, textDecoration: "line-through" }}
          fontSize="inherit"
        />
      ) : notification.aType === "Award" ? (
        <EmojiEventsRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.yellow400 }} fontSize="inherit" />
      ) : notification.aType === "AwardRM" ? (
        <EmojiEventsRoundedIcon
          sx={{ color: DESIGN_SYSTEM_COLORS.yellow400, textDecoration: "line-through" }}
          fontSize="inherit"
        />
      ) : notification.aType === "Accepted" ? (
        <DoneAllRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.yellow400 }} fontSize="inherit" />
      ) : (
        notification.aType === "Delete" && <DeleteForeverRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange700 }} />
      )}
    </Box>
  );
};

export default React.memo(NotificationsList);
