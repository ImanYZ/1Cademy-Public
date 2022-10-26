import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import { Badge, Box, Button } from "@mui/material";
import React, { useState } from "react";

import LogoDarkMode from "../../../../../public/LogoDarkMode.svg";
import LogoLightMode from "../../../../../public/LogoLightMode.svg";
import { Reputation, User, UserTheme } from "../../../../knowledgeTypes";
import { OpenSidebar } from "../../../../pages/dashboard";
import { MemoizedMetaButton } from "../../MetaButton";
import { MemoizedUserStatusIcon } from "../../UserStatusIcon";
import { SidebarWrapper } from "./SidebarWrapper";

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

export const MainSidebar = ({
  open,
  onClose,
  reloadPermanentGrpah,
  user,
  reputation,
  theme,
  onOpenSideBar,
}: //   mapRendered = true,
MainSidebarProps) => {
  //   const db = getFirestore();

  const [uncheckedNotificationsNum /* , setUncheckedNotificationsNum */] = useState(0);
  const [bookmarkUpdatesNum /* , setBookmarkUpdatesNum */] = useState(0);

  //   useEffect(() => {
  //     if (!mapRendered) return;

  //     const notificationNumbersQuery = doc(db, "notificationNums", user.uname);

  //     const killSnapshot = onSnapshot(notificationNumbersQuery, async snapshot => {
  //       if (!snapshot.exists()) return;

  //       setUncheckedNotificationsNum(snapshot.data().nNum);
  //     });
  //     return () => killSnapshot();
  //   }, [db, mapRendered, user]);

  return (
    <SidebarWrapper
      title=""
      //   headerImage={theme === "Dark" ? bookmarksDarkTheme : bookmarksLightTheme}
      open={open}
      onClose={onClose}
      width={80}
      anchor="right"
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
        <Box sx={{ p: "10px" }}>
          <div className="Logo">
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
          </div>

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
          <Button id="SearchButton" onClick={() => onOpenSideBar("SEARCHER_SIDEBAR")}>
            <SearchIcon />
            <span className="SidebarDescription">Search</span>
          </Button>

          {/* Notifications button */}
          <MemoizedMetaButton onClick={() => onOpenSideBar("NOTIFICATION_SIDEBAR")}>
            <Box
              sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "5px", height: "30px" }}
            >
              <Badge
                badgeContent={uncheckedNotificationsNum ?? 0}
                color="error"
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{ wordBreak: "normal", padding: "1px" }}
              >
                {uncheckedNotificationsNum > 0 ? <NotificationsActiveIcon /> : <NotificationsNoneIcon />}
              </Badge>
              <span className="SidebarDescription">Notifications</span>
            </Box>
          </MemoizedMetaButton>

          {/* Bookmarks button */}
          <MemoizedMetaButton
            onClick={() => onOpenSideBar("BOOKMARKS_SIDEBAR")}
            // tooltip="Click to open the bookmarked nodes' updates."
            // tooltipPosition="Right"
          >
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
              <span className="SidebarDescription">Bookmarks</span>
              {/* {bookmarkUpdatesNum > 0 && (
          <div className="NotificationsNum">{shortenNumber(bookmarkUpdatesNum, 2, false)}</div>
        )} */}
            </Box>
          </MemoizedMetaButton>

          {/* Pending proposal sidebar */}
          <MemoizedMetaButton
            onClick={() => onOpenSideBar("PENDING_LIST")}
            // tooltip="Click to open the list of pending proposals."
            // tooltipPosition="Right"
          >
            <Box
              sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "5px", height: "30px" }}
            >
              {/* <Badge
                badgeContent={props.pendingProposalsLoaded ? props.pendingProposalsNum ?? 0 : 0}
                color="error"
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{ padding: "1px", wordBreak: "normal" }}
              >
                <FormatListBulletedIcon />
              </Badge> */}
              <span className="SidebarDescription">Pending List</span>
              {/* {pendingProposalsLoaded && pendingProposalsNum > 0 && (
          <div className="NotificationsNum">{shortenNumber(pendingProposalsNum, 2, false)}</div>
        )} */}
            </Box>
          </MemoizedMetaButton>
        </Box>
      }
    />
  );
};
