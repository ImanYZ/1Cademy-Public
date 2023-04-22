import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, doc, getDocs, getFirestore, increment, limit, query, where, writeBatch } from "firebase/firestore";
import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notificatioType, setNotificationType] = useState<NotificationFilterItem | null>(null);

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
    event.stopPropagation();
    setSelectedNotifications(prev => {
      let sNotifications = [...prev];
      if (event.target.checked === true) {
        sNotifications.push(notificationId);
      } else {
        sNotifications = sNotifications.filter(notification => notification !== notificationId);
      }
      return sNotifications;
    });
    return false;
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
    setSelectedNotifications([]);
  }, [db, props.checked, selectedNotifications, user?.uname]);

  const openLinkedNodeClick = useCallback(
    (notification: any) => {
      notification.aType !== "Delete" && props.openLinkedNode(notification.nodeId);
    },
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

  const handleClearSearchQuery = () => {
    setSearchQuery("");
  };
  const filteredNotifications = useMemo(() => {
    let newNotifications = [...notifications];
    if (searchQuery) {
      newNotifications = notifications.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLocaleLowerCase())
      );
    }
    if (notificatioType) {
      newNotifications = newNotifications.filter(notification => {
        let toReturn = false;
        const filter = NOTITICATION_TYPES[notificatioType];
        for (const type of filter) {
          toReturn = type === notification.oType || (!Array.isArray(notification.aType) && type === notification.aType);
          if (toReturn) break;
        }
        if (toReturn) return notification;
      });
    }
    return newNotifications;
  }, [notificatioType, notifications, searchQuery]);

  const allNotificationsSelected = useMemo(
    () => selectedNotifications.length !== 0 && selectedNotifications.length === filteredNotifications.length,
    [filteredNotifications.length, selectedNotifications.length]
  );

  const onSelectAll = useCallback(() => {
    const notificationIds: string[] = filteredNotifications.reduce(
      (acc, notification) => [...acc, notification.id],
      []
    );
    setSelectedNotifications(notificationIds);
  }, [filteredNotifications]);

  return (
    <Box>
      {!selectedNotifications.length && (
        <>
          <Stack direction={"row"} spacing={"12px"} my="14px" px="16px">
            <TextField
              id="outlined-search"
              type="text"
              placeholder="Search"
              fullWidth
              onChange={event => setSearchQuery(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchQuery.length ? (
                      <IconButton onClick={handleClearSearchQuery}>
                        <CloseRoundedIcon sx={{ fontSize: "14px" }} />
                      </IconButton>
                    ) : null}
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "4px",
                  ":focus-within": {
                    outline: theme => `4px solid ${theme.palette.mode === "dark" ? "#62544B" : "#ECCFBD"}}`,
                  },
                },
              }}
            />
            <NotificationFilter selectedOption={notificatioType} handleSelect={setNotificationType} />
          </Stack>
          <Divider
            sx={{
              borderColor: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray300,
            }}
          />
        </>
      )}

      <Box px="16px" mt="5px">
        {selectedNotifications.length > 0 && (
          <Stack direction={"row"} spacing={"12px"} justifyContent={"space-between"} my="14px">
            <Box>
              <Tooltip title={"Select all"}>
                <IconButton onClick={onSelectAll} sx={{ mr: "12px" }}>
                  {!allNotificationsSelected ? <IndeterminateCheckBoxOutlinedIcon /> : <CheckBoxOutlinedIcon />}
                </IconButton>
              </Tooltip>
              {!props.checked ? (
                <Tooltip title={"Mark as read"}>
                  <IconButton onClick={onReadNotifications}>
                    <DraftsOutlinedIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={"Mark as read"}>
                  <IconButton onClick={onReadNotifications}>
                    <EmailOutlinedIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Button sx={{ color: DESIGN_SYSTEM_COLORS.primary800 }} onClick={() => setSelectedNotifications([])}>
              Cancel
            </Button>
          </Stack>
        )}

        <Stack spacing={"8px"}>
          {filteredNotifications.map(notification => {
            return (
              <Paper
                elevation={2}
                key={`Notification${notification.id}`}
                sx={{
                  display: "flex",

                  listStyle: "none",
                  p: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: theme =>
                    selectedNotifications.includes(notification.id)
                      ? theme.palette.mode === "dark"
                        ? DESIGN_SYSTEM_COLORS.notebookO900
                        : DESIGN_SYSTEM_COLORS.primary50
                      : theme.palette.mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.notebookG700
                      : DESIGN_SYSTEM_COLORS.gray100,
                  ":hover": {
                    cursor: "pointer",
                  },
                }}
              >
                <Box flex={1} onClick={() => openLinkedNodeClick(notification)}>
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
                    <NotificationTypeIcon
                      notification={notification}
                      checked={selectedNotifications.includes(notification.id)}
                    />
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "5px" }}>
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
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

        {props.notifications.length > lastIndex && <Box ref={refInfinityLoaderTrigger}></Box>}
      </Box>
    </Box>
  );
};

const NotificationTypeIcon = ({ notification, checked }: { notification: any; checked: boolean }) => {
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
          checked
            ? theme.palette.mode === "dark"
              ? DESIGN_SYSTEM_COLORS.notebookO800
              : DESIGN_SYSTEM_COLORS.primary25
            : theme.palette.mode === "dark"
            ? DESIGN_SYSTEM_COLORS.notebookG600
            : DESIGN_SYSTEM_COLORS.notebookG50,
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

type NotificationFilterItem = "Approvals" | "Disapprovals" | "Awards" | "Proposals" | "Improvements" | "Invitations";

type NotificationTypes = {
  [key in NotificationFilterItem]: string[];
};

const NOTITICATION_TYPES: NotificationTypes = {
  Approvals: ["Accept"],
  Disapprovals: ["Deleted"],
  Awards: ["Award", "AwardRM"],
  Improvements: ["PropoAccept"],
  Proposals: ["Propo", "Proposal", "AccProposal"],
  Invitations: [],
};

const NOTIFICATION_FILTER_OPTIONS: NotificationFilterItem[] = [
  "Approvals",
  "Disapprovals",
  "Awards",
  "Proposals",
  "Improvements",
  "Invitations",
];
type NotificationFilterProps = {
  selectedOption: NotificationFilterItem | null;
  handleSelect: (option: NotificationFilterItem | null) => void;
};
const NotificationFilter = ({ handleSelect, selectedOption }: NotificationFilterProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelectItem = (option: NotificationFilterItem) => {
    if (selectedOption === option) handleSelect(null);
    else handleSelect(option);
    setAnchorEl(null);
  };
  return (
    <>
      <ButtonBase
        onClick={handleClick}
        sx={{
          borderRadius: "12px",
          alignSelf: "center",
          p: "8px",
          border: theme =>
            `1px solid ${theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray400 : DESIGN_SYSTEM_COLORS.gray400}}`,
          ":hover": {
            borderColor: DESIGN_SYSTEM_COLORS.primary600,
          },
        }}
      >
        <TuneRoundedIcon
          sx={{
            ":hover": {
              color: DESIGN_SYSTEM_COLORS.primary600,
            },
          }}
        />
      </ButtonBase>
      <Menu
        id="basic-menu"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        anchorEl={anchorEl}
        elevation={1}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{
          "& 	.MuiMenu-list": {
            border: ({ palette: { mode } }) =>
              `1px solid ${mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray300}`,
            backgroundColor: ({ palette: { mode } }) =>
              mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
            borderRadius: "4px",
            p: "0",
          },
        }}
      >
        {NOTIFICATION_FILTER_OPTIONS.map(option => (
          <MenuItem
            key={`${option}`}
            onClick={() => handleSelectItem(option)}
            sx={{
              p: "6px 10px",
              minWidth: "210px",
            }}
          >
            <Stack direction={"row"} alignItems={"center"} spacing={"8px"}>
              <Checkbox
                size="small"
                sx={{ p: "8px" }}
                checked={option === selectedOption}
                onChange={() => handleSelectItem(option)}
              />
              <Typography fontSize={"12px"}>{option}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default React.memo(NotificationsList);
