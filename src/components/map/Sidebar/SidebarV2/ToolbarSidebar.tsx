import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import MenuIcon from "@mui/icons-material/Menu";
import { Badge, Box, Button, IconButton, Menu, MenuItem, Stack, Tooltip } from "@mui/material";
import { addDoc, collection, doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import React, { useCallback, useMemo, useState } from "react";

import { useNodeBook } from "@/context/NodeBookContext";

import LogoDarkMode from "../../../../../public/LogoDarkMode.svg";
import LogoLightMode from "../../../../../public/LogoLightMode.svg";
import { Reputation, ReputationSignal, User, UserTheme } from "../../../../knowledgeTypes";
import { UsersStatus, UserTutorials } from "../../../../nodeBookTypes";
import { OpenSidebar } from "../../../../pages/notebook";
import { MemoizedMetaButton } from "../../MetaButton";
import { MemoizedUserStatusSettings } from "../../UserStatusSettings";
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
  openSidebar?: OpenSidebar;
  windowHeight: number;
  reputationSignal: ReputationSignal[];
  onlineUsers: string[];
  usersOnlineStatusLoaded: boolean;
  disableToolbar?: boolean;
  enabledToolbarElements?: string[];
  userTutorial: UserTutorials;
  // setCurrentTutorial: Dispatch<SetStateAction<TutorialKeys>>;
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
  openSidebar,
  windowHeight,
  reputationSignal,
  onlineUsers,
  usersOnlineStatusLoaded,
  disableToolbar = false,
  userTutorial,
}: // setCurrentTutorial,
// enabledToolbarElements = [],
MainSidebarProps) => {
  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const isMenuOpen = nodeBookState.isMenuOpen;

  const db = getFirestore();

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

  const onOpenSidebar = useCallback(
    (SidebarType: OpenSidebar, logName: string) => {
      setOpenSideBar(SidebarType);
      onOpenSidebarLog(logName);
    },
    [setOpenSideBar, onOpenSidebarLog]
  );

  const [anchorEl, setAnchorEl] = useState<any>(null);

  const [pendingProposalsLoaded /* setPendingProposalsLoaded */] = useState(true);

  const onOpenLeaderboardOptions = (event: React.MouseEvent<any>) => {
    setAnchorEl(event.target);
  };

  const onCloseLeaderBoardOptions = () => {
    setAnchorEl(null);
  };

  const instructorsButtonHeight = user.role === "INSTRUCTOR" || user.role === "STUDENT" ? 40 : 0;

  const firstBoxHeight = 375 + instructorsButtonHeight;

  const [leaderBoardType, setLeaderBoardType] = useState<UsersStatus>("Weekly");

  const changeLeaderBoard = useCallback(
    async (lBType: any, username: string) => {
      setLeaderBoardType(lBType);
      setAnchorEl(null);

      await addDoc(collection(db, "userLeaderboardLog"), {
        uname: username,
        type: lBType,
        createdAt: Timestamp.fromDate(new Date()),
      });
    },
    [db]
  );

  const choices = useMemo((): { label: string; choose: any }[] => {
    if (!user) return [];

    return lBTypes.map(lBType => {
      return { label: lBType, choose: () => changeLeaderBoard(lBType, user.uname) };
    });
  }, [changeLeaderBoard, user]);

  const setIsMenuOpen = useCallback(
    (value: boolean) => {
      nodeBookDispatch({ type: "setIsMenuOpen", payload: value });
    },
    [nodeBookDispatch]
  );

  const disableUserStatusButton = disableToolbar; /* || ![].includes(c=>c==="userStatusIconc") */
  const disableSearchButton = disableToolbar;
  const disabledNotificationButton = disableToolbar;
  const disabledBookmarksButton = disableToolbar;
  const disabledPendingProposalButton = disableToolbar;
  const disabledIntructorButton = disableToolbar;
  const disabledLeaderboardButton = disableToolbar;
  const disableUserStatusList = disableToolbar;

  const toolbarContentMemoized = useMemo(() => {
    return (
      <Box
        className={`toolbar ${isMenuOpen ? "toolbar-opened" : ""}`}
        sx={{
          overflow: "hidden",
          display: { xs: isMenuOpen ? "block" : "none", sm: "block" },
          "& .list-tmp": {
            alignItems: isMenuOpen ? "flex-start" : undefined,
          },
          ":hover": {
            "& .list-tmp": {
              alignItems: "flex-start",
            },
          },
        }}
      >
        <Stack
          spacing={"10px"}
          alignItems="center"
          direction="column"
          sx={{
            height: firstBoxHeight,
          }}
        >
          <Box sx={{ marginTop: "10px" }}>
            <MemoizedMetaButton>
              <Box sx={{ display: "grid", placeItems: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={theme === "Light" ? LogoLightMode.src : LogoDarkMode.src} alt="1Logo" width="61px" />
              </Box>
            </MemoizedMetaButton>
          </Box>

          {/* User info button */}

          <MemoizedUserStatusSettings
            id="toolbar-profile-button"
            user={user}
            totalPoints={reputation?.totalPoints || 0}
            totalPositives={reputation?.positives || 0}
            totalNegatives={reputation?.negatives || 0}
            imageUrl={user.imageUrl || ""}
            online={true} // TODO: get online state from useUserState useEffect
            sx={{ display: isMenuOpen ? "flex" : "", alignItems: "center" }}
            onClick={onOpenUserSettingsSidebar}
            isDisabled={disableUserStatusButton}
          />

          {/* Searcher button */}

          <Button
            // className="SearchBarIconToolbar"
            id="toolbar-search-button"
            onClick={() => {
              // const searcherTutorialFinalized = userTutorial.searcher.done || userTutorial.searcher.skipped;
              // if (!searcherTutorialFinalized) setCurrentTutorial("SEARCHER");

              onOpenSidebar("SEARCHER_SIDEBAR", "Search");
              setIsMenuOpen(false);
            }}
            disabled={disableSearchButton}
            sx={{
              width: "100%",
              borderRadius: "0px 50px 50px 0px",
              backgroundColor: theme =>
                disableSearchButton
                  ? theme.palette.mode === "dark"
                    ? "#383838ff"
                    : "#bdbdbdff"
                  : "rgba(255, 152, 0, 1)",
              color: "white",
              lineHeight: "19px",
              height: "40px",
              textAlign: "left",
              alignSelf: "flex-start",
              display: "flex",
              gap: isMenuOpen ? "6px" : "6px",
              padding: "6px 0px",
              paddingLeft: isMenuOpen ? "20px" : "0px",
              ":hover": {
                backgroundColor: disableToolbar ? "#747474ff" : "rgba(255, 152, 0, 1)",
              },
            }}
          >
            <Box
              className="toolbarBadge"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "19px",
              }}
            >
              🔍
            </Box>

            <Box
              component="span"
              className="toolbarDescription"
              sx={{
                fontSize: "15px",
                lineHeight: isMenuOpen ? "16px" : "0",
                height: isMenuOpen ? "24px" : "0",
                overflow: "hidden",
                visibility: isMenuOpen ? "visible" : "hidden",
                transition: isMenuOpen
                  ? "visibility 1s, line-height 1s, height 1s"
                  : "visibility 0s, line-height 0s, height 0s",
                width: isMenuOpen ? "100px" : "0",
                display: isMenuOpen ? "flex" : "block",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              Search
            </Box>
          </Button>

          {/* Notifications button */}
          <MemoizedMetaButton
            id="toolbar-bookmarks-button"
            onClick={() => {
              onOpenSidebar("NOTIFICATION_SIDEBAR", "Notifications");
              setIsMenuOpen(false);
            }}
            disabled={disabledNotificationButton}
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
              <Badge
                className="toolbarBadge"
                badgeContent={uncheckedNotificationsNum ?? 0}
                color="error"
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{
                  wordBreak: "normal",
                  padding: "1px",
                  marginLeft: isMenuOpen ? "20px" : "0px",
                  color: "ButtonHighlight",
                }}
              >
                🔔
              </Badge>
              <Box
                component="span"
                className="toolbarDescription"
                sx={{
                  fontSize: "15px",
                  lineHeight: isMenuOpen ? "16px" : "0",
                  height: isMenuOpen ? "24px" : "0",
                  overflow: "hidden",
                  visibility: isMenuOpen ? "visible" : "hidden",
                  transition: isMenuOpen
                    ? "visibility 1s, line-height 1s, height 1s"
                    : "visibility 0s, line-height 0s, height 0s",
                  width: isMenuOpen ? "100px" : "0",
                  display: isMenuOpen ? "flex" : "block",
                  alignItems: "center",
                }}
              >
                Notifications
              </Box>
            </Box>
          </MemoizedMetaButton>

          {/* Bookmarks button */}
          <MemoizedMetaButton
            onClick={() => {
              onOpenSidebar("BOOKMARKS_SIDEBAR", "Bookmarks");
              setIsMenuOpen(false);
            }}
            disabled={disabledBookmarksButton}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", height: "30px" }}>
              <Badge
                className="toolbarBadge"
                badgeContent={bookmarkUpdatesNum ?? 0}
                color="error"
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{
                  wordBreak: "normal",
                  padding: "1px",
                  marginLeft: isMenuOpen ? "20px" : "0px",
                  color: "ButtonHighlight",
                }}
              >
                🔖
              </Badge>
              <Box
                component="span"
                className="toolbarDescription"
                sx={{
                  fontSize: "15px",
                  lineHeight: isMenuOpen ? "16px" : "0",
                  height: isMenuOpen ? "24px" : "0",
                  overflow: "hidden",
                  visibility: isMenuOpen ? "visible" : "hidden",
                  transition: isMenuOpen
                    ? "visibility 1s, line-height 1s, height 1s"
                    : "visibility 0s, line-height 0s, height 0s",
                  width: isMenuOpen ? "100px" : "0",
                  display: isMenuOpen ? "flex" : "block",
                  alignItems: "center",
                }}
              >
                Bookmarks
              </Box>
            </Box>
          </MemoizedMetaButton>

          {/* Pending proposal sidebar */}
          <MemoizedMetaButton
            id="toolbar-pending-list"
            onClick={() => {
              onOpenSidebar("PENDING_PROPOSALS", "PendingProposals");
              setIsMenuOpen(false);
            }}
            disabled={disabledPendingProposalButton}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", height: "30px" }}>
              <Badge
                className="toolbarBadge"
                badgeContent={pendingProposalsLoaded ? pendingProposalsNum ?? 0 : 0}
                color="error"
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{
                  padding: "1px",
                  wordBreak: "normal",
                  marginLeft: isMenuOpen ? "20px" : "0px",
                  color: "ButtonHighlight",
                }}
              >
                ✏️
              </Badge>
              <Box
                component="span"
                className="toolbarDescription"
                sx={{
                  fontSize: "15px",
                  lineHeight: isMenuOpen ? "16px" : "0",
                  height: isMenuOpen ? "24px" : "0",
                  overflow: "hidden",
                  visibility: isMenuOpen ? "visible" : "hidden",
                  transition: isMenuOpen
                    ? "visibility 1s, line-height 1s, height 1s"
                    : "visibility 0s, line-height 0s, height 0s",
                  width: isMenuOpen ? "100px" : "0",
                  display: isMenuOpen ? "flex" : "block",
                  alignItems: "center",
                }}
              >
                Pending List
              </Box>
            </Box>
          </MemoizedMetaButton>
          {["INSTRUCTOR", "STUDENT"].includes(user.role ?? "") && (
            <MemoizedMetaButton
              onClick={() => {
                if (user.role === "INSTRUCTOR") return window.open("/instructors/dashboard", "_blank");
                if (user.role === "STUDENT") return window.open(`/instructors/dashboard/${user.uname}`, "_blank");
              }}
              disabled={disabledIntructorButton}
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
                  sx={{
                    fontSize: "20px",
                    padding: "1px",
                    wordBreak: "normal",
                    marginLeft: isMenuOpen ? "20px" : "0px",
                    color: "ButtonHighlight",
                  }}
                >
                  🎓
                </Box>

                <Box
                  component="span"
                  className="toolbarButtonDescription"
                  sx={{
                    fontSize: "15px",
                    lineHeight: isMenuOpen ? "16px" : "0",
                    height: isMenuOpen ? "41px" : "0",
                    width: isMenuOpen ? "100px" : "0",
                    overflow: "hidden",
                    visibility: isMenuOpen ? "visible" : "hidden",
                    transition: isMenuOpen
                      ? "visibility 1s, line-height 1s, height 1s;"
                      : "visibility 0s, line-height 0s, height 0s",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
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
                    Dashboard
                  </div>
                </Box>
              </Box>
            </MemoizedMetaButton>
          )}
          {user?.tag && (
            <>
              <MemoizedMetaButton
                onClick={(e: any) => onOpenLeaderboardOptions(e)}
                disabled={disabledLeaderboardButton}
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
                    sx={{
                      fontSize: "20px",
                      padding: "1px",
                      wordBreak: "normal",
                      marginLeft: isMenuOpen ? "20px" : "0px",
                      color: "ButtonHighlight",
                    }}
                  >
                    🏆
                  </Box>

                  <Box
                    component="span"
                    className="toolbarButtonDescription"
                    sx={{
                      fontSize: "15px",
                      lineHeight: isMenuOpen ? "16px" : "0",
                      height: isMenuOpen ? "41px" : "0",
                      width: isMenuOpen ? "100px" : "0",
                      overflow: "hidden",
                      visibility: isMenuOpen ? "visible" : "hidden",
                      transition: isMenuOpen
                        ? "visibility 1s, line-height 1s, height 1s;"
                        : "visibility 0s, line-height 0s, height 0s",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
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
                      {leaderBoardType ? leaderBoardType : "Leaderboard"}
                    </div>
                  </Box>
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
                >
                  {choices.map(choice => {
                    return (
                      <MenuItem key={choice.label} onClick={choice.choose}>
                        {choice.label}
                      </MenuItem>
                    );
                  })}
                </Menu>
              }
            </>
          )}
        </Stack>

        <Stack
          spacing={"10px"}
          direction="column"
          sx={{
            height: `calc(${windowHeight}px - ${firstBoxHeight}px)`,
            paddingBottom: "20px",
          }}
        >
          {user?.tag && leaderBoardType && (
            <UsersStatusList
              onlineUsers={onlineUsers}
              usersOnlineStatusLoaded={usersOnlineStatusLoaded}
              usersStatus={leaderBoardType}
              reloadPermanentGraph={reloadPermanentGrpah}
              setOpenSideBar={setOpenSideBar}
              reputationSignal={reputationSignal}
              sx={{
                // display: isMenuOpen ? "flex" : "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
              disabled={disableUserStatusList}
            />
          )}
        </Stack>
      </Box>
    );
  }, [
    isMenuOpen,
    firstBoxHeight,
    theme,
    user,
    reputation?.totalPoints,
    reputation?.positives,
    reputation?.negatives,
    onOpenUserSettingsSidebar,
    disableUserStatusButton,
    disableSearchButton,
    disableToolbar,
    disabledNotificationButton,
    uncheckedNotificationsNum,
    disabledBookmarksButton,
    bookmarkUpdatesNum,
    disabledPendingProposalButton,
    pendingProposalsLoaded,
    pendingProposalsNum,
    disabledIntructorButton,
    disabledLeaderboardButton,
    leaderBoardType,
    anchorEl,
    choices,
    windowHeight,
    onlineUsers,
    usersOnlineStatusLoaded,
    reloadPermanentGrpah,
    setOpenSideBar,
    reputationSignal,
    disableUserStatusList,
    onOpenSidebar,
    setIsMenuOpen,
  ]);

  const contentSignalState = useMemo(() => {
    return { updated: true };
  }, [
    user,
    selectedUser,
    isMenuOpen,
    bookmarkUpdatesNum,
    uncheckedNotificationsNum,
    pendingProposalsNum,
    reputation,
    windowHeight,
    anchorEl,
    reputationSignal,
    onlineUsers,
    usersOnlineStatusLoaded,
    disableToolbar,
    disableUserStatusButton,
    disableSearchButton,
    disabledNotificationButton,
    disabledBookmarksButton,
    disabledPendingProposalButton,
    disabledIntructorButton,
    disabledLeaderboardButton,
    userTutorial.searcher.done,
    userTutorial.searcher.skipped,
  ]);

  return (
    <>
      <Tooltip
        placement={isMenuOpen ? "right" : "bottom"}
        title={isMenuOpen ? "Hide Menu" : "Open Menu"}
        sx={{
          display: { xs: "block", sm: "none" },
          position: "fixed",
          top: "10px",
          left: isMenuOpen ? "10px" : "10px",
          zIndex: isMenuOpen ? "1300" : "1200",
          background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
          height: "40px",
          width: "40px",
        }}
      >
        <IconButton
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          {!isMenuOpen ? <MenuIcon /> : <KeyboardArrowLeftIcon />}
        </IconButton>
      </Tooltip>

      <SidebarWrapper
        id="sidebar-wrapper-toolbar"
        title=""
        open={open}
        onClose={onClose}
        width={isMenuOpen ? 150 : 80}
        hoverWidth={168}
        showCloseButton={false}
        showScrollUpButton={false}
        isMenuOpen={isMenuOpen}
        openSidebar={openSidebar}
        contentSignalState={contentSignalState}
        SidebarContent={toolbarContentMemoized}
      />
    </>
  );
};

export const MemoizedToolbarSidebar = React.memo(ToolbarSidebar);
