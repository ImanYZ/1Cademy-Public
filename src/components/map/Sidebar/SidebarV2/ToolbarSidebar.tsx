import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, Button, Divider, IconButton, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { addDoc, collection, doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import NextImage from "next/image";
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { ChosenTag, MemoizedTagsSearcher } from "@/components/TagsSearcher";
import { useNodeBook } from "@/context/NodeBookContext";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { retrieveAuthenticatedUser } from "@/lib/firestoreClient/auth";
import { Post } from "@/lib/mapApi";

import BookmarkIcon from "../../../../../public/bookmark.svg";
import EditIcon from "../../../../../public/edit.svg";
import LogoExtended from "../../../../../public/full-logo.svg";
import GraduatedIcon from "../../../../../public/graduated.svg";
import LogoDarkMode from "../../../../../public/LogoDarkMode.svg";
import LogoLightMode from "../../../../../public/LogoLightMode.svg";
import NotebookIcon from "../../../../../public/notebooks.svg";
import NotificationIcon from "../../../../../public/notification.svg";
import SearchIcon from "../../../../../public/search.svg";
import TagIcon from "../../../../../public/tag.svg";
import { useHover } from "../../../../hooks/userHover";
import { DispatchAuthActions, Reputation, ReputationSignal, User, UserTheme } from "../../../../knowledgeTypes";
import { UsersStatus, UserTutorials } from "../../../../nodeBookTypes";
import { OpenSidebar } from "../../../../pages/notebook";
import { Notebook } from "../../../../types";
import { CustomBadge } from "../../CustomBudge";
import Modal from "../../Modal/Modal";
import { SidebarButton } from "../../SidebarButtons";
import { MemoizedUserStatusSettings } from "../../UserStatusSettings2";
import MultipleChoiceBtn from "../MultipleChoiceBtn";
import UsersStatusList from "../UsersStatusList";
import { SidebarWrapper } from "./SidebarWrapper";

const lBTypes = ["Weekly", "Monthly", "All Time", "Others Votes", "Others Monthly"];

type MainSidebarProps = {
  notebookRef: any;
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
  dispatch: React.Dispatch<DispatchAuthActions>;
  notebooks: Notebook[];
  onChangeNotebook: (notebookId: string) => void;
  selectedNotebook: string;
  // setCurrentTutorial: Dispatch<SetStateAction<TutorialKeys>>;
};

export const ToolbarSidebar = ({
  notebookRef,
  open,
  onClose,
  reloadPermanentGrpah,
  user,
  reputation,
  // theme,
  setOpenSideBar,
  selectedUser,
  uncheckedNotificationsNum = 0,
  bookmarkUpdatesNum = 0,
  pendingProposalsNum = 0,
  openSidebar,
  windowHeight,
  reputationSignal,
  onlineUsers,
  usersOnlineStatusLoaded,
  disableToolbar = false,
  userTutorial,
  dispatch,
  notebooks,
  onChangeNotebook,
  selectedNotebook,
}: // setCurrentTutorial,
// enabledToolbarElements = [],
MainSidebarProps) => {
  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMenuOpen = isMobile && nodeBookState.isMenuOpen;

  const db = getFirestore();
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const { allTags, setAllTags } = useTagsTreeView(user.tagId ? [user.tagId] : []);
  const [leaderboardTypeOpen, setLeaderboardTypeOpen] = useState<boolean>(false);
  const [shouldShowTagSearcher, setShouldShowTagSearcher] = useState<boolean>(false);
  const [displayNotebooks, setDisplayNotebooks] = useState(false);
  const { ref, isHovered } = useHover();

  const displayLargeToolbar = useMemo(() => isHovered || isMenuOpen, [isHovered, isMenuOpen]);
  // console.log({ displayLargeToolbar, isHovered, isMenuOpen });

  useEffect(() => {
    if (chosenTags.length > 0 && chosenTags[0].id in allTags) {
      notebookRef.current.chosenNode = { id: chosenTags[0].id, title: chosenTags[0].title };
      nodeBookDispatch({ type: "setChosenNode", payload: { id: chosenTags[0].id, title: chosenTags[0].title } });
      setShouldShowTagSearcher(false);
    }
  }, [allTags, chosenTags, nodeBookDispatch]);

  // this useEffect updated the defaultTag when chosen node change
  useEffect(() => {
    const setDefaultTag = async () => {
      if (nodeBookState.choosingNode?.id === "ToolbarTag" && nodeBookState.chosenNode) {
        const { id: nodeId, title: nodeTitle } = nodeBookState.chosenNode;
        notebookRef.current.choosingNode = null;
        notebookRef.current.chosenNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        nodeBookDispatch({ type: "setChosenNode", payload: null });
        try {
          dispatch({
            type: "setAuthUser",
            payload: { ...user, tagId: nodeId, tag: nodeTitle },
          });
          await Post(`/changeDefaultTag/${nodeId}`);
          let { reputation, user: userUpdated } = await retrieveAuthenticatedUser(user.userId, user.role);
          if (!reputation) throw Error("Cant find Reputation");
          if (!userUpdated) throw Error("Cant find User");

          dispatch({ type: "setReputation", payload: reputation });
          dispatch({ type: "setAuthUser", payload: userUpdated });
        } catch (err) {
          console.error(err);
        }
      }
    };
    setDefaultTag();
  }, [dispatch, nodeBookDispatch, nodeBookState.chosenNode, user]);

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

  const choosingNodeClick = useCallback(
    (choosingNodeTag: string) => {
      notebookRef.current.choosingNode = { id: choosingNodeTag, type: null };
      nodeBookDispatch({ type: "setChoosingNode", payload: { id: choosingNodeTag, type: null } });
    },
    [nodeBookDispatch]
  );

  const closeTagSelector = useCallback(() => {
    notebookRef.current.chosenNode = null;
    notebookRef.current.choosingNode = null;
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    nodeBookDispatch({ type: "setChoosingNode", payload: null });
    setShouldShowTagSearcher(false);
  }, [nodeBookDispatch]);

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

  const [leaderBoardType, setLeaderBoardType] = useState<UsersStatus>("Weekly");

  const changeLeaderBoard = useCallback(
    async (lBType: any, username: string) => {
      setLeaderBoardType(lBType);

      await addDoc(collection(db, "userLeaderboardLog"), {
        uname: username,
        type: lBType,
        createdAt: Timestamp.fromDate(new Date()),
      });
      setLeaderboardTypeOpen(false);
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

  const openLeaderboardTypes = useCallback(() => {
    setLeaderboardTypeOpen(oldCLT => !oldCLT);
  }, [setLeaderboardTypeOpen]);

  const disableUserStatusButton = disableToolbar; /* || ![].includes(c=>c==="userStatusIconc") */
  const disableSearchButton = disableToolbar;
  const disabledNotificationButton = disableToolbar;
  const disabledBookmarksButton = disableToolbar;
  const disabledPendingProposalButton = disableToolbar;
  const disabledIntructorButton = disableToolbar;
  const disabledLeaderboardButton = disableToolbar;
  const disableUserStatusList = disableToolbar;

  useEffect(() => {
    if (!displayLargeToolbar) {
      setDisplayNotebooks(false);
      setLeaderboardTypeOpen(false);
    }
  }, [displayLargeToolbar]);

  const toolbarContentMemoized = useMemo(() => {
    return (
      <Box
        id="toolbar"
        className={`toolbar ${isMenuOpen ? "toolbar-opened" : ""}`}
        ref={ref}
        sx={{
          minHeight: "100%",
          width: "inherit",
          overflow: "hidden",
          display: { xs: isMenuOpen ? "grid" : "none", sm: "grid" },
          gridTemplateRows: "auto auto  1fr",
          background: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.darkBackground : theme.palette.common.lightBackground,
        }}
      >
        <Stack alignItems="center" direction="column" spacing={"4px"} sx={{ width: "inherit", px: "14px" }}>
          <Box sx={{ marginTop: "10px", marginBottom: "15px", display: "grid", placeItems: "center" }}>
            {displayLargeToolbar ? (
              <img src={LogoExtended.src} alt="1Logo" width={"100%"} height={"64px"} />
            ) : (
              <img
                src={theme.palette.mode === "light" ? LogoLightMode.src : LogoDarkMode.src}
                alt="1Logo"
                width="61px"
                height={"64px"}
              />
            )}
          </Box>

          {/* User info button */}

          <MemoizedUserStatusSettings
            // id="toolbar-profile-button"
            user={user}
            totalPoints={reputation?.totalPoints || 0}
            totalPositives={reputation?.positives || 0}
            totalNegatives={reputation?.negatives || 0}
            imageUrl={user.imageUrl || ""}
            online={true} // TODO: get online state from useUserState useEffect
            onClick={onOpenUserSettingsSidebar}
            smallVersion={!displayLargeToolbar}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          />

          {/* Searcher button */}

          <SidebarButton
            id="toolbar-search-button"
            iconSrc={SearchIcon}
            onClick={() => {
              onOpenSidebar("SEARCHER_SIDEBAR", "Search");
              setIsMenuOpen(false);
            }}
            text="Search"
            toolbarIsOpen={displayLargeToolbar}
            variant="fill"
          />

          {/* Notifications button */}

          <SidebarButton
            id="toolbar-notifications-button"
            iconSrc={NotificationIcon}
            onClick={() => {
              onOpenSidebar("NOTIFICATION_SIDEBAR", "Notifications");
              setIsMenuOpen(false);
            }}
            text="Notifications"
            toolbarIsOpen={displayLargeToolbar}
            rightOption={<CustomBadge value={uncheckedNotificationsNum} />}
          />

          {/* Bookmarks button */}
          <SidebarButton
            id="toolbar-bookmarks-button"
            iconSrc={BookmarkIcon}
            onClick={() => {
              onOpenSidebar("BOOKMARKS_SIDEBAR", "Bookmarks");
              setIsMenuOpen(false);
            }}
            text="Bookmarks"
            toolbarIsOpen={displayLargeToolbar}
            rightOption={<CustomBadge value={bookmarkUpdatesNum} />}
          />

          {/* Pending proposal sidebar */}
          <SidebarButton
            id="toolbar-pending-proposal-button"
            iconSrc={EditIcon}
            onClick={() => {
              onOpenSidebar("PENDING_PROPOSALS", "PendingProposals");
              setIsMenuOpen(false);
            }}
            text="Pending List"
            toolbarIsOpen={displayLargeToolbar}
            rightOption={<CustomBadge value={pendingProposalsNum} />}
          />

          {/* dashboard */}
          {["INSTRUCTOR", "STUDENT"].includes(user.role ?? "") && (
            <SidebarButton
              id="toolbar-dashboard-button"
              iconSrc={GraduatedIcon}
              onClick={() => {
                if (user.role === "INSTRUCTOR") return window.open("/instructors/dashboard", "_blank");
                if (user.role === "STUDENT") return window.open(`/instructors/dashboard/${user.uname}`, "_blank");
              }}
              text="Dashboard"
              toolbarIsOpen={displayLargeToolbar}
            />
          )}

          {/* notebooks */}
          <SidebarButton
            id="toolbar-notebooks-button"
            iconSrc={NotebookIcon}
            onClick={e => {
              e.preventDefault();
              setDisplayNotebooks(!displayNotebooks);
            }}
            text="Notebooks"
            toolbarIsOpen={displayLargeToolbar}
            rightOption={
              <KeyboardArrowDownIcon sx={{ transition: ".3s", rotate: displayNotebooks ? "180deg" : "0deg" }} />
            }
          />

          {displayNotebooks && displayLargeToolbar && (
            <Box sx={{ width: "100%" }}>
              <Stack className="scroll-styled" sx={{ width: "100%", maxHeight: "126px", overflowY: "auto" }}>
                {notebooks.map((cur, idx) => (
                  <Box
                    key={idx}
                    onClick={() => onChangeNotebook(cur.id)}
                    sx={{
                      p: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    {/* min-width is making ellipsis works correctly */}
                    <Box sx={{ minWidth: "0px", display: "flex", alignItems: "center" }}>
                      <Box sx={{ minWidth: "0px", display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            background: selectedNotebook === cur.id ? "#12B76A" : "none",
                            minWidth: "10px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            mr: "10px",
                          }}
                        />
                        <Typography
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cur.title}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton sx={{ p: "0px" }}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Divider />

              <Box sx={{ p: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton sx={{ p: "0px", borderRadius: "5px" }}>
                    <AddIcon />
                  </IconButton>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        ml: "20px",
                      }}
                    >
                      Create New
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Stack>

        {/* --------------- */}

        {displayLargeToolbar && (
          <Button
            sx={{
              p: "11px 16px",
              width: "100%",
              height: "100%",
              ":hover": {
                background: theme => (theme.palette.mode === "dark" ? "#55402B" : "#FFE2D0"),
              },
            }}
            onClick={() => {
              setShouldShowTagSearcher(true);
              choosingNodeClick("ToolbarTag");
            }}
          >
            <Box
              sx={{
                minWidth: "0px",
                display: "flex",
                width: "100%",
              }}
            >
              <NextImage width={"25px"} src={TagIcon} alt="tag icon" />

              <Typography
                sx={{
                  minWidth: "0px",
                  marginLeft: "4px",
                  color: theme => (theme.palette.mode === "dark" ? "#EAECF0" : "#1D2939"),
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.tag}
              </Typography>
            </Box>
          </Button>
        )}

        {shouldShowTagSearcher && (
          <Suspense fallback={<div>loading...</div>}>
            <Box
              // id="tagModal"
              sx={{
                position: "fixed",
                left: "270px",
                top: "114px",
              }}
            >
              <Modal
                className="tagSelectorModalUserSetting ModalBody"
                onClick={closeTagSelector}
                returnDown={false}
                noBackground={true}
                style={{
                  width: "441px",
                  height: "495px",
                }}
                contentStyle={{
                  height: "500px",
                }}
              >
                <MemoizedTagsSearcher
                  id="user-settings-tag-searcher"
                  setChosenTags={setChosenTags}
                  chosenTags={chosenTags}
                  allTags={allTags}
                  setAllTags={setAllTags}
                  sx={{ maxHeight: "339px", height: "339px" }}
                />
              </Modal>
            </Box>
          </Suspense>
        )}

        {/* --------------- */}

        {!displayLargeToolbar && (
          <Box
            sx={{
              display: window.innerWidth <= 500 ? "none" : "block",
              width: "50%",
              margin: "auto",
              marginTop: "10px",
              marginBottom: "14px",
              borderTop: theme => (theme.palette.mode === "dark" ? "solid 1px #303134" : "solid 1px #EAECF0"),
            }}
          />
        )}

        {/* --------------- */}

        <Stack
          spacing={"10px"}
          direction="column"
          sx={{
            paddingBottom: "20px",
            position: "relative",
            height: "100%",
            width: "inherit",
          }}
        >
          {displayLargeToolbar && (
            <>
              <Button
                sx={{
                  mx: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  ":hover": {
                    background: theme => (theme.palette.mode === "dark" ? "#55402B" : "#FFE2D0"),
                  },
                }}
                onClick={openLeaderboardTypes}
              >
                <Box
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    color: theme => (theme.palette.mode === "dark" ? "#eaecf0" : "#475467"),
                  }}
                >
                  {leaderBoardType ? leaderBoardType : "Leaderboard"}
                </Box>
                <KeyboardArrowDownIcon sx={{ transition: ".3s", rotate: leaderboardTypeOpen ? "180deg" : "0deg" }} />
              </Button>
              {leaderboardTypeOpen && (
                <MultipleChoiceBtn
                  sx={{
                    zIndex: 999,
                    width: "86%",
                    marginX: "auto",
                    left: "7%",
                    top: "25px",
                    height: "173px",
                  }}
                  choices={choices}
                  onClose={openLeaderboardTypes}
                  comLeaderboardType={leaderBoardType ? leaderBoardType : "Leaderboard"}
                />
              )}
            </>
          )}
          {user?.tag && leaderBoardType && (
            <UsersStatusList
              onlineUsers={onlineUsers}
              usersOnlineStatusLoaded={usersOnlineStatusLoaded}
              usersStatus={leaderBoardType}
              nodeBookDispatch={nodeBookDispatch}
              reloadPermanentGraph={reloadPermanentGrpah}
              setOpenSideBar={setOpenSideBar}
              reputationSignal={reputationSignal}
              sx={{ px: "16px" }}
              sxUserStatus={{
                justifyContent: "flex-start",
                alignItems: "center",
                width: "100%",
              }}
              disabled={disableUserStatusList}
              isSmaller={!displayLargeToolbar}
            />
          )}
        </Stack>
      </Box>
    );
  }, [
    isMenuOpen,
    ref,
    displayLargeToolbar,
    theme.palette.mode,
    user,
    reputation?.totalPoints,
    reputation?.positives,
    reputation?.negatives,
    onOpenUserSettingsSidebar,
    uncheckedNotificationsNum,
    bookmarkUpdatesNum,
    pendingProposalsNum,
    displayNotebooks,
    notebooks,
    shouldShowTagSearcher,
    closeTagSelector,
    chosenTags,
    allTags,
    setAllTags,
    openLeaderboardTypes,
    leaderBoardType,
    leaderboardTypeOpen,
    choices,
    onlineUsers,
    usersOnlineStatusLoaded,
    nodeBookDispatch,
    reloadPermanentGrpah,
    setOpenSideBar,
    reputationSignal,
    disableUserStatusList,
    onOpenSidebar,
    setIsMenuOpen,
    selectedNotebook,
    onChangeNotebook,
    choosingNodeClick,
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
    leaderboardTypeOpen,
    leaderBoardType,
    shouldShowTagSearcher,
    setChosenTags,
    chosenTags,
    displayNotebooks,
    displayLargeToolbar,
    notebooks,
    selectedNotebook,
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
        width={80}
        // width={window.innerWidth <= 500 ? "100%" : isMenuOpen ? "100%" : 80}
        showCloseButton={false}
        showScrollUpButton={false}
        isMenuOpen={isMenuOpen}
        openSidebar={openSidebar}
        contentSignalState={contentSignalState}
        SidebarContent={toolbarContentMemoized}
        sx={{
          boxShadow: undefined,
          // overflow: "hidden",
          width: { sm: isHovered ? "250px" : "80px" },
          ...(isMenuOpen && { width: "100%" }),

          // width: { xs: displayLargeToolbar ? "100%" : "80px", sm: "80px" },
          // maxWidth: { xs: displayLargeToolbar ? "100%" : "80px", sm: "80px" },
          // ":hover": {
          //   width: { xs: isMenuOpen ? "100%" : "80px", sm: "250px" },
          // maxWidth: { xs: isMenuOpen ? "100%" : "80px", sm: "250px" },
          // },
        }}
        sxContentWrapper={{
          width: "inherit",
          overflow: "hidden",
          overflowY: isMenuOpen ? "auto" : "hidden",
          ":hover": {
            overflowY: "auto",
          },
        }}
      />
    </>
  );
};

export const MemoizedToolbarSidebar = React.memo(ToolbarSidebar);
