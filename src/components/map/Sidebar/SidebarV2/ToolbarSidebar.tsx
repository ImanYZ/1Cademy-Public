import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import { Badge, Box, Button, Menu, MenuItem } from "@mui/material";
import { addDoc, collection, doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import React, { useCallback, useMemo, useState } from "react";

import LogoDarkMode from "../../../../../public/LogoDarkMode.svg";
import LogoLightMode from "../../../../../public/LogoLightMode.svg";
import { Reputation, User, UserTheme } from "../../../../knowledgeTypes";
import { UsersStatus } from "../../../../nodeBookTypes";
import { OpenSidebar } from "../../../../pages/dashboard";
import { MemoizedMetaButton } from "../../MetaButton";
import { MemoizedUserStatusSettings } from "../../UserStatusSettings";
// import MultipleChoiceBtn from "../MultipleChoiceBtn";
import UsersStatusList from "../UsersStatusList";
import { SidebarWrapper } from "./SidebarWrapper";

const lBTypes = ["Weekly", "Monthly", "All Time", "Others Votes", "Others Monthly"];

type MainSidebarProps = {
  open: boolean;
  onClose: () => void;
  reloadPermanentGrpah: any;
  user: User;
  theme: UserTheme;
  reputation: Reputation;
  setOpenSideBar: (sidebar: OpenSidebar) => void;
  mapRendered: boolean;
  selectedUser: string | null;
  uncheckedNotificationsNum: number;
  bookmarkUpdatesNum: number;
  pendingProposalsNum: number;
};

export const ToolbarSidebar = ({
  open,
  onClose,
  reloadPermanentGrpah,
  user,
  reputation,
  theme,
  setOpenSideBar,
  selectedUser,
  uncheckedNotificationsNum,
  bookmarkUpdatesNum,
  pendingProposalsNum,
}: //   mapRendered = true,
MainSidebarProps) => {
  const db = getFirestore();

  const [leaderboardType, setLeaderboardType] = useState<UsersStatus>("Weekly");
  // const [leaderboardTypeOpen, setLeaderboardTypeOpen] = useState(false);

  const [pendingProposalsLoaded /* setPendingProposalsLoaded */] = useState(true);

  const [anchorEl, setAnchorEl] = useState<any>(null);

  const onOpenLeaderboardOptions = (event: React.MouseEvent<any>) => {
    console.log("set target", event.target);

    setAnchorEl(event.target);
  };
  const onCloseLeaderBoardOptions = () => {
    setAnchorEl(null);
  };

  //   useEffect(() => {
  //     if (!mapRendered) return;

  //     const notificationNumbersQuery = doc(db, "notificationNums", user.uname);

  //     const killSnapshot = onSnapshot(notificationNumbersQuery, async snapshot => {
  //       if (!snapshot.exists()) return;

  //       setUncheckedNotificationsNum(snapshot.data().nNum);
  //     });
  //     return () => killSnapshot();
  //   }, [db, mapRendered, user]);

  const changeLeaderboard = useCallback(
    async (lBType: any, username: string) => {
      // console.log("==>> changeLeaderboard", lBType, username);
      setLeaderboardType(lBType);
      setAnchorEl(null);
      // setLeaderboardTypeOpen(false);

      await addDoc(collection(db, "userLeaderboardLog"), {
        uname: username,
        type: lBType,
        createdAt: Timestamp.fromDate(new Date()),
      });

      // const userLeaderboardLogRef = firebase.db.collection("userLeaderboardLog").doc();
      // userLeaderboardLogRef.set({
      //   uname: username,
      //   type: lBType,
      //   createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      // });
    },
    [db]
  );

  const choices = useMemo((): { label: string; choose: any }[] => {
    if (!user) return [];

    return lBTypes.map(lBType => {
      return { label: lBType, choose: () => changeLeaderboard(lBType, user.uname) };
    });
  }, [changeLeaderboard, user]);

  // const leaderboardTypesToggle = useCallback(() => {
  //   setLeaderboardTypeOpen(oldCLT => !oldCLT);
  // }, []);
  const onOpenSidebarLog = useCallback(
    async (sidebarType: string) => {
      const userOpenSidebarLogObj: any = {
        uname: user.uname,
        sidebarType,
        createdAt: Timestamp.fromDate(new Date()),
      };
      if (selectedUser) {
        userOpenSidebarLogObj.selectedUser = selectedUser;
      }
      const userOpenSidebarLogRef = doc(collection(db, "userOpenSidebarLog"));
      await setDoc(userOpenSidebarLogRef, userOpenSidebarLogObj);
    },
    [db, selectedUser, user.uname]
  );

  const onOpenUserSettingsSidebar = useCallback(() => {
    const userUserInfoCollection = collection(db, "userUserInfoLog");
    setOpenSideBar("USER_SETTINGS");
    addDoc(userUserInfoCollection, {
      uname: user.uname,
      uInfo: user.uname,
      createdAt: Timestamp.fromDate(new Date()),
    });
    // onOpenSidebarLog("Search");
  }, [db, setOpenSideBar, user.uname]);
  // const onOpenUserInfoSidebar = useCallback(() => {
  //   const userUserInfoCollection = collection(db, "userUserInfoLog");
  //   nodeBookDispatch({
  //     type: "setSelectedUser",
  //     payload: {
  //       username: user.uname,
  //       imageUrl: user.imageUrl,
  //       fullName: user.fName,
  //       chooseUname: user.chooseUname,
  //     },
  //   });
  //   setOpenSideBar("USER_SETTINGS");
  //   reloadPermanentGrpah();
  //   addDoc(userUserInfoCollection, {
  //     uname: user.uname,
  //     uInfo: user.uname,
  //     createdAt: Timestamp.fromDate(new Date()),
  //   });
  //   // onOpenSidebarLog("Search");
  // }, [
  //   db,
  //   nodeBookDispatch,
  //   reloadPermanentGrpah,
  //   setOpenSideBar,
  //   user.chooseUname,
  //   user.fName,
  //   user.imageUrl,
  //   user.uname,
  // ]);
  // const onOpenSearcherSidebar = useCallback(() => {
  //   onOpenSideBar("SEARCHER_SIDEBAR");
  //   onOpenSidebarLog("Search");
  // }, [onOpenSideBar, onOpenSidebarLog]);

  // const onOpenNotificationSidebar = useCallback(() => {
  //   onOpenSideBar("NOTIFICATION_SIDEBAR");
  //   onOpenSidebarLog("Notifications");
  // }, [onOpenSideBar, onOpenSidebarLog]);

  // const onOpenBookmarksSidebar = useCallback(() => {
  //   onOpenSideBar("NOTIFICATION_SIDEBAR");
  //   onOpenSidebarLog("Bookmarks");
  // }, [onOpenSideBar, onOpenSidebarLog]);

  // const onOpenPendingProposalsSidebar = useCallback(() => {
  //   onOpenSideBar("PENDING_PROPOSALS");
  //   onOpenSidebarLog("PendingProposals");
  // }, [onOpenSideBar, onOpenSidebarLog]);

  const onOpenSidebar = useCallback(
    (SidebarType: OpenSidebar, logName: string) => {
      setOpenSideBar(SidebarType);
      onOpenSidebarLog(logName);
    },
    [setOpenSideBar, onOpenSidebarLog]
  );

  return (
    <SidebarWrapper
      title=""
      //   headerImage={theme === "Dark" ? bookmarksDarkTheme : bookmarksLightTheme}
      open={open}
      onClose={onClose}
      width={80}
      hoverWidth={150}
      // anchor="right"
      showCloseButton={false}
      showScrollUpButton={false}
      //   SidebarOptions={
      //     <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%" }}>
      //       <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"}>
      //         {[{ title: "Updated" }, { title: "Studied" }].map((tabItem: any, idx: number) => (
      //           <Tab key={tabItem.title} label={tabItem.title} {...a11yProps(idx)} />
      //         ))}
      //       </Tabs>
      //     </Box>
      //   }
      SidebarContent={
        <Box className="toolbar" sx={{ overflow: "hidden" }}>
          <Box
            // className="toolbar-options"
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", height: "376px" }}
          >
            <Box sx={{ marginTop: "20px" }}>
              <MemoizedMetaButton
              // onClick={openSideBarClick("Trends")} // CHECK: I commented this, the sidebar trends was commented
              // tooltip="Click to open the trends in proposals."
              // tooltipPosition="Right"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Box sx={{ display: "grid", placeItems: "center" }}>
                  <img src={theme === "Light" ? LogoLightMode.src : LogoDarkMode.src} alt="1Logo" width="61px" />
                </Box>
              </MemoizedMetaButton>
            </Box>

            {/* User info button */}
            <MemoizedUserStatusSettings
              user={user}
              totalPoints={reputation?.totalPoints || 0}
              totalPositives={reputation?.positives || 0}
              totalNegatives={reputation?.negatives || 0}
              imageUrl={user.imageUrl || ""}
              online={true} // TODO: get online state from useUserState useEffect
              sx={{ justifyContent: "center" }}
              onClick={onOpenUserSettingsSidebar}
            />

            {/* Searcher button */}
            <Button
              onClick={() => onOpenSidebar("SEARCHER_SIDEBAR", "Search")}
              sx={{
                width: "100%",
                borderRadius: "0px 50px 50px 0px",
                backgroundColor: "rgba(255, 152, 0, 1)",
                color: "white",
                lineHeight: "19px",
                height: "40px",
                textAlign: "left",
                alignSelf: "flex-start",
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                padding: "6px 0px",
                // border: "solid 2px blue",
                ":hover": {
                  backgroundColor: "rgba(255, 152, 0, 1)",
                },
              }}
            >
              <div className="toolbarBadge" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SearchIcon />
              </div>
              <Box
                component="span"
                className="toolbarDescription"
                sx={{
                  fontSize: "15px",
                  lineHeight: "0",
                  height: "0",
                  overflow: "hidden",
                  visibility: "hidden",
                  transition: "visibility 0s, line-height 0s, height 0s",
                  width: "0",
                }}
              >
                Search
              </Box>
            </Button>

            {/* Notifications button */}
            <MemoizedMetaButton onClick={() => onOpenSidebar("NOTIFICATION_SIDEBAR", "Notifications")}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  height: "30px",
                }}
              >
                <Badge
                  className="toolbarBadge"
                  badgeContent={uncheckedNotificationsNum ?? 0}
                  color="error"
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  sx={{ wordBreak: "normal", padding: "1px" }}
                >
                  {uncheckedNotificationsNum > 0 ? <NotificationsActiveIcon /> : <NotificationsNoneIcon />}
                </Badge>
                <Box
                  component="span"
                  className="toolbarDescription"
                  sx={{
                    fontSize: "15px",
                    lineHeight: "0",
                    height: "0",
                    width: "0",

                    overflow: "hidden",
                    visibility: "hidden",
                    transition: "visibility 0s, line-height 0s, height 0s",
                  }}
                >
                  Notifications
                </Box>
              </Box>
            </MemoizedMetaButton>

            {/* Bookmarks button */}
            <MemoizedMetaButton onClick={() => onOpenSidebar("BOOKMARKS_SIDEBAR", "Bookmarks")}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", height: "30px" }}>
                <Badge
                  className="toolbarBadge"
                  badgeContent={bookmarkUpdatesNum ?? 0}
                  color="error"
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  sx={{ wordBreak: "normal", padding: "1px" }}
                >
                  <BookmarkBorderIcon className="material-icons" />
                </Badge>
                <Box
                  component="span"
                  className="toolbarDescription"
                  sx={{
                    fontSize: "15px",
                    lineHeight: "0",
                    height: "0",
                    width: "0",
                    overflow: "hidden",
                    visibility: "hidden",
                    transition: "visibility 0s, line-height 0s, height 0s",
                  }}
                >
                  Bookmarks
                </Box>
              </Box>
            </MemoizedMetaButton>

            {/* Pending proposal sidebar */}
            <MemoizedMetaButton onClick={() => onOpenSidebar("PENDING_PROPOSALS", "PendingProposals")}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", height: "30px" }}>
                <Badge
                  className="toolbarBadge"
                  badgeContent={pendingProposalsLoaded ? pendingProposalsNum ?? 0 : 0}
                  color="error"
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  sx={{ padding: "1px", wordBreak: "normal" }}
                >
                  <FormatListBulletedIcon />
                </Badge>
                <Box
                  component="span"
                  className="toolbarDescription"
                  sx={{
                    fontSize: "15px",
                    lineHeight: "0",
                    height: "0",
                    width: "0",
                    overflow: "hidden",
                    visibility: "hidden",
                    transition: "visibility 0s, line-height 0s, height 0s",
                  }}
                >
                  Pending List
                </Box>
              </Box>
            </MemoizedMetaButton>

            {/* leaderboard options */}
            {user?.tag && (
              <>
                <MemoizedMetaButton
                  // onClick={leaderboardTypesToggle}
                  onClick={(e: any) => onOpenLeaderboardOptions(e)}
                  // tooltip={
                  //   "Click to " +
                  //   (props.usersStatus ? "hide" : "show") +
                  //   " the user contribution trends."
                  // }
                  // tooltipPosition="Right"
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      height: "30px",
                    }}
                  >
                    <Box
                      className="LeaderbaordIcon toolbarBadge"
                      sx={{ fontSize: "20px", padding: "1px", wordBreak: "normal" }}
                    >
                      🏆
                    </Box>
                    {/* CHECK: I commeted this beacuse reputationsLoaded state only exist in userStatusList component */}
                    {/* {!props.reputationsLoaded && (
                      <div className="preloader-wrapper small active">
                        <div className="spinner-layer spinner-yellow-only">
                          <div className="circle-clipper left">
                            <div className="circle"></div>
                          </div>
                          <div className="gap-patch">
                            <div className="circle"></div>
                          </div>
                          <div className="circle-clipper right">
                            <div className="circle"></div>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* <div id="LeaderboardChanger" className="SidebarDescription">
                    <div id="LeaderboardTag" style={{ textOverflow: "ellipsis", width: "90px" }}>
                      {user.tag}
                    </div>
                    <div id="LeaderboardType" style={{ fontSize: "12px" }}>
                      {leaderboardType ? leaderboardType : "Leaderboard"}
                    </div>
                  </div> */}
                    <Box
                      component="span"
                      className="toolbarButtonDescription"
                      sx={{
                        fontSize: "15px",
                        lineHeight: "0",
                        height: "0",
                        width: "0",
                        overflow: "hidden",
                        visibility: "hidden",
                        transition: "visibility 0s, line-height 0s, height 0s",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        id=""
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxWidth: "90px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.tag}
                      </div>
                      <div
                        id=""
                        style={{
                          fontSize: "12px",
                          maxWidth: "90px",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {leaderboardType ? leaderboardType : "Leaderboard"}
                      </div>
                    </Box>
                    {/* <Box>
                    <Box
                      component="span"
                      className="toolbarButtonDescription"
                      sx={{
                        fontSize: "15px",
                        lineHeight: "0",
                        whiteSpace: "nowrap",
                        height: "0",
                        overflow: "hidden",
                        visibility: "hidden",
                        // transition: "visibility 0s, line-height 0s, height 0s",
                        textOverflow: "ellipsis",
                        width: "90px",
                      }}
                    >
                      {user.tag}
                    </Box>{" "}
                    <Box
                      component="span"
                      className="toolbarButtonDescription"
                      sx={{
                        fontSize: "15px",
                        lineHeight: "0",
                        height: "0",
                        overflow: "hidden",
                        visibility: "hidden",
                        // transition: "visibility 0s, line-height 0s, height 0s",
                      }}
                    >
                      {leaderboardType ? leaderboardType : "Leaderboard"}
                    </Box>
                    <Box
                      component="span"
                      className="toolbarDescription"
                      sx={{
                        fontSize: "15px",
                        lineHeight: "0",
                        height: "0",
                        overflow: "hidden",
                        visibility: "hidden",
                        transition: "visibility 0s, line-height 0s, height 0s",
                      }}
                    >
                      Pending List
                    </Box>
                  </Box> */}
                  </Box>
                </MemoizedMetaButton>
                {
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={onCloseLeaderBoardOptions}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                    // anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  >
                    {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem> */}

                    {choices.map(choice => {
                      return (
                        <MenuItem key={choice.label} onClick={choice.choose}>
                          {choice.label}
                        </MenuItem>
                      );
                    })}
                  </Menu>
                  // <MultipleChoiceBtn
                  //   choices={choices}
                  //   onClose={onCloseLeaderBoardOptions}
                  //   anchorEl={anchorEl} /* onClose={leaderboardTypesToggle} */
                  // />
                }
              </>
            )}
          </Box>
          <Box sx={{ height: "calc(100vh - 400px)", paddingBottom: "20px" }}>
            {user?.tag && leaderboardType && (
              <UsersStatusList
                // reputationsLoaded={props.reputationsLoaded}
                // reputationsWeeklyLoaded={props.reputationsWeeklyLoaded}
                // reputationsMonthlyLoaded={props.reputationsMonthlyLoaded}
                // reloadPermanentGrpah={props.reloadPermanentGrpah}
                usersStatus={leaderboardType}
                reloadPermanentGraph={reloadPermanentGrpah}
                setOpenSideBar={setOpenSideBar}
              />
            )}
          </Box>
        </Box>
      }
    />
  );
};
