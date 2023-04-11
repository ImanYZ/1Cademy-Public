import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputAdornment,
  ListItemText,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
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
import NextImage from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import FilterIcon from "../../../../../public/filter.svg";
import FilterDarkIcon from "../../../../../public/filter-dark.svg";
import NoNotificationIcon from "../../../../../public/no-notification-dark.svg";
import ReadAllIcon from "../../../../../public/read-all.svg";
import SelectAllIcon from "../../../../../public/select-all.svg";
import NotificationsList from "../NotificationsList";
import { SidebarWrapper } from "./SidebarWrapper";

type NotificationSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
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

const names = ["Approvals", "Disapprovals", "Awards", "Proposals", "Improvements", "Invitations"];

const NotificationSidebar = ({
  open,
  onClose,
  theme,
  openLinkedNode,
  username,
  sidebarWidth,
  innerHeight,
  innerWidth,
}: NotificationSidebarProps) => {
  const [value, setValue] = React.useState(0);
  const [checkedNotifications, setCheckedNotifications] = useState<Notification[]>([]);
  const [uncheckedNotifications, setUncheckedNotifications] = useState<Notification[]>([]);
  const [showClearIcon, setShowClearIcon] = useState<string>("none");
  const [openFilter, setOpenFilter] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<string[]>([]);
  const [markNotifications, setMarkNotifications] = useState<string[]>([]);

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

  const checkNotifications = useCallback(async () => {
    if (!username) return;
    const batch = writeBatch(db);

    for (const notification of markNotifications) {
      const notificationRef = doc(db, "notifications", notification);
      batch.update(notificationRef, { checked: true });
    }

    const notificationNumsQuery = query(collection(db, "notificationNums"), where("uname", "==", username), limit(1));
    const notificationNumsDocs = await getDocs(notificationNumsQuery);
    if (notificationNumsDocs.docs.length) {
      const notificationNumsRef = doc(db, "notificationNums", notificationNumsDocs.docs[0].id);
      let nNums = notificationNumsDocs.docs[0].data().nNum - markAllNotifications.length;
      batch.update(notificationNumsRef, { nNum: nNums > 0 ? nNums : 0 });
    }
    await batch.commit();
  }, [db, username]);

  const markAllNotifications = () => {
    let notificationIds: string[] = [];
    for (const notification of uncheckedNotifications) {
      notificationIds = [...notificationIds, notification.id];
    }
    setMarkNotifications(notificationIds);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setShowClearIcon(event.target.value === "" ? "none" : "flex");
  };

  const setNotificationFilter = (name: string) => {
    const index = filter.indexOf(name);
    if (index > -1) {
      setFilter([...filter.filter((fName: string) => fName !== name)]);
    } else {
      setFilter([...filter, name]);
    }
  };

  // const filteredNotifications = () => {
  //   const filteredArray = uncheckedNotifications.filter(notification =>
  //     filter.some(fltr => fltr === notification.aType)
  //   );
  // };

  const contentSignalState = useMemo(() => {
    return [...uncheckedNotifications];
  }, [checkedNotifications, uncheckedNotifications, value, openFilter, filter, markNotifications]);

  return (
    <SidebarWrapper
      open={open}
      title="Notifications"
      width={sidebarWidth}
      height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      // anchor="right"
      onClose={onClose}
      SidebarOptions={
        <Box
          sx={{
            marginTop: "25px",
            borderBottom: 1,
            borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
            width: "100%",
          }}
        >
          <Tabs value={value} onChange={handleChange} aria-label={"Notification Tabs"} variant="fullWidth">
            {[{ title: "Unread" }, { title: "Read" }].map((tabItem, idx: number) => (
              <Tab
                key={tabItem.title}
                id={`notifications-tab-${tabItem.title.toLowerCase()}`}
                label={tabItem.title}
                {...a11yProps(idx)}
              />
            ))}
          </Tabs>
        </Box>
      }
      contentSignalState={contentSignalState}
      SidebarContent={
        <Box sx={{ display: "flex", flexDirection: "column", padding: "16px" }}>
          {((!uncheckedNotifications.length && value === 0) || (!checkedNotifications.length && value === 1)) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "50%",
                textAlign: "center",
              }}
            >
              <NextImage src={theme === "Dark" ? NoNotificationIcon : NoNotificationIcon} alt="Notification icon" />
              <Typography
                sx={{
                  fontSize: "20px",
                  width: "240px",
                  fontWeight: "500",
                }}
              >
                You've not checked off any notifications
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  width: "355px",
                  color: theme => (theme.palette.mode === "dark" ? "#AEAEAE" : "#344054"),
                }}
              >
                If you mark your notifications as read, they'll show up in this list.
              </Typography>
            </Box>
          )}
          {uncheckedNotifications.length > 0 && value === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {markNotifications.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingY: "14px",
                    height: "72px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <Button
                      sx={{
                        justifyContent: "stretch",
                        textAlign: "left",
                        padding: "0",
                        minWidth: "0px",
                        ":hover": {
                          background: "transparent",
                        },
                      }}
                      onClick={() => markAllNotifications()}
                    >
                      <NextImage width={"22px"} height={"22px"} src={SelectAllIcon.src} alt="Select icon" />
                    </Button>
                    <Button
                      sx={{
                        justifyContent: "stretch",
                        textAlign: "left",
                        padding: "0",
                        minWidth: "0px",
                        ":hover": {
                          background: "transparent",
                        },
                      }}
                      onClick={() => checkNotifications()}
                    >
                      <NextImage width={"22px"} height={"22px"} src={ReadAllIcon.src} alt="Read icon" />
                    </Button>
                  </Box>
                  <Button
                    sx={{
                      justifyContent: "stretch",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#FF6D00",
                      ":hover": {
                        background: "transparent",
                      },
                    }}
                    onClick={() => setMarkNotifications([])}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
              {markNotifications.length === 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingY: "16px",
                    height: "72px",
                  }}
                >
                  <FormControl>
                    <TextField
                      placeholder="Search"
                      size="small"
                      variant="outlined"
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end" style={{ display: showClearIcon }}>
                            <ClearIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        width: "370px",
                        height: "40px",
                        border: theme => (theme.palette.mode === "dark" ? "1px solid #404040" : "solid 1px #D0D5DD"),
                        borderRadius: "4px",
                      }}
                    />
                  </FormControl>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        border: theme => (theme.palette.mode === "dark" ? "1px solid #404040" : "solid 1px #D0D5DD"),
                        display: "flex",
                        justifyContent: "center",
                        cursor: "pointer",
                        minWidth: "0px",
                        ...(openFilter && {
                          border: "solid 1px #FF8134",
                        }),
                      }}
                      onClick={() => setOpenFilter(!openFilter)}
                    >
                      <NextImage
                        width={"22px"}
                        height={"22px"}
                        src={theme === "Dark" ? FilterIcon.src : FilterDarkIcon.src}
                        alt="Filter icon"
                      />
                      {openFilter && (
                        <Box
                          sx={{
                            border: theme =>
                              theme.palette.mode === "dark" ? "1px solid #404040" : "1px solid #D0D5DD",
                            position: "absolute",
                            right: "0px",
                            top: "45px",
                            background: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : "#F9FAFB"),
                            zIndex: "99",
                            borderRadius: "4px",
                            padding: "3px 0px 3px 0px",
                          }}
                        >
                          {names.map(name => (
                            <MenuItem
                              sx={{
                                color: theme => (theme.palette.mode === "dark" ? "#FCFCFD" : "#1D2939"),

                                textAlign: "left",
                                height: "34px",
                                padding: "8px 10px 8px 10px",
                                background: theme =>
                                  filter.indexOf(name) > -1
                                    ? theme.palette.mode === "dark"
                                      ? "#55402B"
                                      : "#FFE2D0"
                                    : undefined,
                                ":hover": {
                                  background: theme => (theme.palette.mode === "dark" ? "#55402B" : "#FFE2D0"),
                                },
                              }}
                              onClick={() => setNotificationFilter(name)}
                              key={name}
                              value={name}
                            >
                              <Checkbox checked={filter.indexOf(name) > -1} />
                              <ListItemText
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  lineHeight: "18px",
                                }}
                                primary={name}
                              />
                            </MenuItem>
                          ))}
                        </Box>
                      )}
                    </Button>
                    {/* <Select
                    sx={{
                      marginLeft: "10px",
                      height: "30px",
                      width: "90px",
                    }}
                    labelId="demo-select-small"
                    id="demo-select-small"
                    value={10}
                    onChange={() => {}}
                  >
                    <MenuItem value={10}>All</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select> */}
                  </Box>
                </Box>
              )}
              <NotificationsList
                markNotifications={markNotifications}
                setMarkNotifications={setMarkNotifications}
                notifications={uncheckedNotifications}
                openLinkedNode={openLinkedNode}
                checked={false}
              />
            </Box>
          )}
          {checkedNotifications.length > 0 && value === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <NotificationsList
                markNotifications={markNotifications}
                setMarkNotifications={setMarkNotifications}
                notifications={checkedNotifications}
                openLinkedNode={openLinkedNode}
                checked={true}
              />
            </Box>
          )}
        </Box>
      }
    />
  );
};
export const MemoizedNotificationSidebar = React.memo(NotificationSidebar);
