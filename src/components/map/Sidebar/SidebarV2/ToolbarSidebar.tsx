import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import { Badge, Box, Button, Menu, MenuItem } from "@mui/material";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import React, { useCallback, useMemo, useState } from "react";

import LogoDarkMode from "../../../../../public/LogoDarkMode.svg";
import LogoLightMode from "../../../../../public/LogoLightMode.svg";
import { Reputation, User, UserTheme } from "../../../../knowledgeTypes";
import { UsersStatus } from "../../../../nodeBookTypes";
import { OpenSidebar } from "../../../../pages/dashboard";
import { MemoizedMetaButton } from "../../MetaButton";
import { MemoizedUserStatusIcon } from "../../UserStatusIcon";
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
  onOpenSideBar: (sidebar: OpenSidebar) => void;
  mapRendered: boolean;
};

export const ToolbarSidebar = ({
  open,
  onClose,
  reloadPermanentGrpah,
  user,
  reputation,
  theme,
  onOpenSideBar,
}: //   mapRendered = true,
MainSidebarProps) => {
  const db = getFirestore();
  const [leaderboardType, setLeaderboardType] = useState<UsersStatus>("Weekly");
  const [leaderboardTypeOpen, setLeaderboardTypeOpen] = useState(false);
  const [uncheckedNotificationsNum /* , setUncheckedNotificationsNum */] = useState(0);
  const [bookmarkUpdatesNum /* , setBookmarkUpdatesNum */] = useState(0);
  const [pendingProposalsLoaded /* setPendingProposalsLoaded */] = useState(false);
  const [pendingProposalsNum /* setPendingProposalsNum */] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
      setLeaderboardTypeOpen(false);

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
        <Box className="toolbar" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
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
          <MemoizedUserStatusIcon
            uname={user.uname}
            totalPoints={reputation?.totalPoints || 0}
            totalPositives={reputation?.positives || 0}
            totalNegatives={reputation?.negatives || 0}
            imageUrl={user.imageUrl || ""}
            fullname={user.fName + " " + user.lName}
            chooseUname={user.chooseUname}
            // online={isOnline}
            online={true} // TODO: get online state from useUserState useEffect
            inUserBar={true}
            inNodeFooter={false}
            reloadPermanentGrpah={reloadPermanentGrpah}
            sx={{ justifyContent: "center" }}
          />

          {/* Searcher button */}
          <Button
            onClick={() => onOpenSideBar("SEARCHER_SIDEBAR")}
            sx={{
              width: "90%",
              borderRadius: "0px 50px 50px 0px",
              backgroundColor: "rgba(255, 152, 0, 1)",
              color: "white",
              lineHeight: "19px",
              height: "40px",
              textAlign: "left",
              alignSelf: "flex-start",
              ":hover": {
                backgroundColor: "rgba(255, 152, 0, 1)",
              },
            }}
          >
            <SearchIcon />
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
              Search
            </Box>
          </Button>

          {/* Notifications button */}
          <MemoizedMetaButton onClick={() => onOpenSideBar("NOTIFICATION_SIDEBAR")}>
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
          <MemoizedMetaButton onClick={() => onOpenSideBar("BOOKMARKS_SIDEBAR")}>
            <Box
              sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "5px", height: "30px" }}
            >
              <Badge
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
          <MemoizedMetaButton onClick={() => onOpenSideBar("PENDING_LIST")}>
            <Box
              sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "5px", height: "30px" }}
            >
              <Badge
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
                    justifyContent: "flex-start",
                    gap: "5px",
                    height: "30px",
                  }}
                >
                  <div className="LeaderbaordIcon">🏆</div>
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
                      p: "0",
                      m: "0",
                      fontSize: "15px",
                      lineHeight: "0",
                      height: "0",
                      overflow: "hidden",
                      visibility: "hidden",
                      transition: "visibility 0s, line-height 0s, height 0s",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div id="" style={{ textOverflow: "ellipsis", maxWidth: "90px" }}>
                      {user.tag}
                    </div>
                    <div id="" style={{ fontSize: "12px" }}>
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
              {leaderboardTypeOpen && (
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
              )}
              {leaderboardType && (
                <UsersStatusList
                  // reputationsLoaded={props.reputationsLoaded}
                  // reputationsWeeklyLoaded={props.reputationsWeeklyLoaded}
                  // reputationsMonthlyLoaded={props.reputationsMonthlyLoaded}
                  // reloadPermanentGrpah={props.reloadPermanentGrpah}
                  usersStatus={leaderboardType}
                  reloadPermanentGraph={reloadPermanentGrpah}
                />
              )}
            </>
          )}
        </Box>
      }
    />
  );
};
