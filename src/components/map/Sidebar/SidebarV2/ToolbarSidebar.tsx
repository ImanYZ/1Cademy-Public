import { ExpandLess, ExpandMore } from "@mui/icons-material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, IconButton, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { addDoc, collection, doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import NextImage from "next/image";
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { ChosenTag, MemoizedTagsSearcher } from "@/components/TagsSearcher";
import { useNodeBook } from "@/context/NodeBookContext";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { retrieveAuthenticatedUser } from "@/lib/firestoreClient/auth";
import { Post } from "@/lib/mapApi";

import CademyHead from "../../../../../public/1Cademy-head.svg";
import BookmarkIcon from "../../../../../public/bookmark.svg";
import EditIcon from "../../../../../public/edit.svg";
import LogoExtended from "../../../../../public/full-logo.svg";
import GraduatedIcon from "../../../../../public/graduated.svg";
import NotificationIcon from "../../../../../public/notification.svg";
import SearchIcon from "../../../../../public/search.svg";
import TagIcon from "../../../../../public/tag.svg";
import { DispatchAuthActions, Reputation, ReputationSignal, User, UserTheme } from "../../../../knowledgeTypes";
import { UsersStatus, UserTutorials } from "../../../../nodeBookTypes";
import { OpenSidebar } from "../../../../pages/notebook";
import Modal from "../../Modal/Modal";
import { MemoizedUserStatusSettings } from "../../UserStatusSettings";
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
  // setCurrentTutorial: Dispatch<SetStateAction<TutorialKeys>>;
};

export const ToolbarSidebar = ({
  notebookRef,
  open,
  onClose,
  reloadPermanentGrpah,
  user,
  reputation,
  theme: userTheme,
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
  dispatch,
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

  const [pendingProposalsLoaded /* setPendingProposalsLoaded */] = useState(true);

  const instructorsButtonHeight = user.role === "INSTRUCTOR" || user.role === "STUDENT" ? 40 : 0;

  const firstBoxHeight = 500 + instructorsButtonHeight;

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

  const toolbarContentMemoized = useMemo(() => {
    return (
      <Box
        className={`toolbar ${isMenuOpen ? "toolbar-opened" : ""}`}
        sx={{
          overflow: "hidden",
          paddingX: "5px",
          background: ({ palette }) =>
            palette.mode === "dark" ? palette.common.notebookMainBlack : palette.common.gray50,
          display: { xs: isMenuOpen ? "block" : "none", sm: "block" },
          "& .list-tmp": {
            alignItems: isMenuOpen ? "flex-start" : undefined,
          },
          ":hover": {
            "& .list-tmp": {
              alignItems: "flex-start",
            },
          },
          height: window.innerHeight >= 400 ? "100vh" : "250%",
        }}
      >
        <Stack alignItems="center" direction="column">
          <Box sx={{ marginTop: "20px", marginBottom: "5px" }}>
            <Box
              sx={{
                display: "flex",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {window.innerWidth >= 600 && (
                <img className="hide-on-hover" src={CademyHead.src} alt="1Logo" width="61px" height={"83px"} />
              )}
              <img
                style={{
                  display: window.innerWidth >= 600 ? "none" : "flex",
                }}
                className={window.innerWidth >= 600 ? "show-on-hover" : undefined}
                src={LogoExtended.src}
                alt="1Logo"
                width={"100%"}
                height={"83px"}
              />
            </Box>
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
              width: "90%",
              marginTop: "14px",
              marginLeft: "5%!important",
              borderRadius: "16px",
              backgroundColor: theme =>
                disableSearchButton ? (theme.palette.mode === "dark" ? "#383838ff" : "#bdbdbdff") : "#F38744",
              color: "white",
              lineHeight: "19px",
              height: "40px",
              textAlign: "left",
              alignSelf: "flex-start",
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              padding: "12px 0px 12px 12px",
              justifyContent: "start",
              ":hover": {
                backgroundColor: theme =>
                  disableSearchButton
                    ? theme.palette.mode === "dark"
                      ? "#383838ff"
                      : "#bdbdbdff"
                    : theme.palette.mode === "dark"
                    ? "#F38744"
                    : "#FF914E",
              },
            }}
          >
            <Box
              className="toolbarBadge"
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: "19px",
                marginLeft: !isMenuOpen ? "10px" : undefined,
              }}
            >
              <NextImage width={"22px"} src={SearchIcon} alt="previous node icon" />
            </Box>

            <Box
              component="span"
              className="toolbarDescription"
              sx={{
                fontSize: "15px",
                overflow: "hidden",
                visibility: isMenuOpen ? "visible" : "hidden",
                transition: isMenuOpen
                  ? "visibility 1s, line-height 1s, height 1s"
                  : "visibility 0s, line-height 0s, height 0s",
                width: isMenuOpen ? "100px" : "0",
                display: isMenuOpen ? "flex" : "block",
                alignItems: "center",
                textAlign: "center",
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
              }}
            >
              <Typography
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: "90px",
                  whiteSpace: "nowrap",
                  fontWeight: "500",
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                }}
              >
                Search
              </Typography>
            </Box>
          </Button>

          {/* Notifications button */}
          <Button
            id="toolbar-bookmarks-button"
            onClick={() => {
              onOpenSidebar("NOTIFICATION_SIDEBAR", "Notifications");
              setIsMenuOpen(false);
            }}
            disabled={disabledNotificationButton}
            sx={{
              width: "90%",
              marginTop: "14px",
              borderRadius: "16px",
              padding: "10px 0px 10px 12px",
              justifyContent: "start",
              ":hover": {
                background: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookO900 : theme.palette.common.primary50,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginLeft: !isMenuOpen ? "10px" : undefined,
              }}
            >
              {window.innerWidth >= 600 && (uncheckedNotificationsNum ?? 0) > 0 && (
                <Box
                  className={"hide-on-hover"}
                  sx={{
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#E34848",
                    top: "8px",
                    left: "41px",
                  }}
                />
              )}
              <NextImage width={"22px"} src={NotificationIcon} alt="previous node icon" />
              <Box
                className="toolbarDescription"
                component="span"
                sx={{
                  fontSize: "15px",
                  overflow: "hidden",
                  visibility: isMenuOpen ? "visible" : "hidden",
                  transition: isMenuOpen
                    ? "visibility 1s, line-height 1s, height 1s"
                    : "visibility 0s, line-height 0s, height 0s",
                  width: isMenuOpen ? "100px" : "0",
                  display: isMenuOpen ? "flex" : "block",
                  alignItems: "center",
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                }}
              >
                <Typography
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: "90px",
                    whiteSpace: "nowrap",
                    fontWeight: "500",
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                  }}
                >
                  Notifications
                </Typography>
              </Box>
              {(uncheckedNotificationsNum ?? 0) > 0 && (
                <Box
                  className={window.innerWidth >= 600 ? "show-on-hover" : ""}
                  sx={{
                    width: "44px",
                    height: "26px",
                    borderRadius: "28px",
                    background: "#E34848",
                    color: "white",
                    display: window.innerWidth >= 600 ? "none" : "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    right: "20px",
                    padding: "4px, 10px, 4px, 10px",
                  }}
                >
                  {uncheckedNotificationsNum > 100 ? "+99" : uncheckedNotificationsNum}
                </Box>
              )}
            </Box>
          </Button>

          {/* Bookmarks button */}
          <Button
            onClick={() => {
              onOpenSidebar("BOOKMARKS_SIDEBAR", "Bookmarks");
              setIsMenuOpen(false);
            }}
            disabled={disabledBookmarksButton}
            sx={{
              width: "90%",
              marginTop: "14px",
              borderRadius: "16px",
              padding: "10px 0px 10px 12px",
              justifyContent: "start",
              ":hover": {
                background: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookO900 : theme.palette.common.primary50,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginLeft: !isMenuOpen ? "10px" : undefined,
              }}
            >
              {window.innerWidth >= 600 && (bookmarkUpdatesNum ?? 0) > 0 && (
                <Box
                  className={"hide-on-hover"}
                  sx={{
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#E34848",
                    top: "8px",
                    left: "41px",
                  }}
                />
              )}
              <NextImage width={"22px"} src={BookmarkIcon} alt="previous node icon" />
              <Box
                className="toolbarDescription"
                sx={{
                  fontSize: "15px",
                  overflow: "hidden",
                  visibility: isMenuOpen ? "visible" : "hidden",
                  transition: isMenuOpen
                    ? "visibility 1s, line-height 1s, height 1s"
                    : "visibility 0s, line-height 0s, height 0s",
                  width: isMenuOpen ? "100px" : "0",
                  display: isMenuOpen ? "flex" : "block",
                  alignItems: "center",
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                }}
              >
                <Typography
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: "90px",
                    whiteSpace: "nowrap",
                    fontWeight: "500",
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                  }}
                >
                  Bookmarks
                </Typography>
              </Box>

              {(bookmarkUpdatesNum ?? 0) > 0 && (
                <Box
                  className={window.innerWidth >= 600 ? "show-on-hover" : ""}
                  sx={{
                    width: "44px",
                    height: "26px",
                    borderRadius: "28px",
                    background: "#E34848",
                    color: "white",
                    display: window.innerWidth >= 600 ? "none" : "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    right: "20px",
                    padding: "4px, 10px, 4px, 10px",
                  }}
                >
                  {bookmarkUpdatesNum > 100 ? "+99" : bookmarkUpdatesNum}
                </Box>
              )}
            </Box>
          </Button>

          <Button
            onClick={() => {
              onOpenSidebar("PENDING_PROPOSALS", "PendingProposals");
              setIsMenuOpen(false);
            }}
            disabled={disabledBookmarksButton}
            sx={{
              width: "90%",
              marginTop: "14px",
              borderRadius: "16px",
              padding: "10px 0px 10px 12px",
              justifyContent: "start",
              ":hover": {
                background: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookO900 : theme.palette.common.primary50,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginLeft: !isMenuOpen ? "10px" : undefined,
              }}
            >
              {window.innerWidth >= 600 && (pendingProposalsNum ?? 0) > 0 && (
                <Box
                  className={window.innerWidth >= 500 ? "hide-on-hover" : ""}
                  sx={{
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#E34848",
                    top: "8px",
                    left: "41px",
                  }}
                />
              )}
              <NextImage width={"22px"} src={EditIcon} alt="previous node icon" />
              <Box
                className="toolbarDescription"
                sx={{
                  fontSize: "15px",
                  overflow: "hidden",
                  visibility: isMenuOpen ? "visible" : "hidden",
                  transition: isMenuOpen
                    ? "visibility 1s, line-height 1s, height 1s"
                    : "visibility 0s, line-height 0s, height 0s",
                  width: isMenuOpen ? "100px" : "0",
                  display: isMenuOpen ? "flex" : "block",
                  alignItems: "center",
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                }}
              >
                <Typography
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: "90px",
                    whiteSpace: "nowrap",
                    fontWeight: "500",
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                  }}
                >
                  Proposals
                </Typography>
              </Box>

              {(pendingProposalsNum ?? 0) > 0 && (
                <Box
                  className={window.innerWidth >= 600 ? "show-on-hover" : ""}
                  sx={{
                    width: "44px",
                    height: "26px",
                    borderRadius: "28px",
                    background: "#E34848",
                    color: "white",
                    display: window.innerWidth >= 600 ? "none" : "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    right: "20px",
                    padding: "4px, 10px, 4px, 10px",
                  }}
                >
                  {pendingProposalsNum > 100 ? "+99" : pendingProposalsNum}
                </Box>
              )}
            </Box>
          </Button>

          {/* Pending proposal sidebar */}

          {["INSTRUCTOR", "STUDENT"].includes(user.role ?? "") && (
            <Button
              onClick={() => {
                if (user.role === "INSTRUCTOR") return window.open("/instructors/dashboard", "_blank");
                if (user.role === "STUDENT") return window.open(`/instructors/dashboard/${user.uname}`, "_blank");
              }}
              disabled={disabledIntructorButton}
              sx={{
                width: "90%",
                marginTop: "14px",
                borderRadius: "16px",
                padding: "10px 0px 10px 12px",
                justifyContent: "start",
                ":hover": {
                  background: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookO900 : theme.palette.common.primary50,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginLeft: !isMenuOpen ? "10px" : undefined,
                }}
              >
                <NextImage width={"22px"} src={GraduatedIcon} alt="previous node icon" />
                <Box
                  className="toolbarDescription"
                  sx={{
                    fontSize: "15px",
                    overflow: "hidden",
                    visibility: isMenuOpen ? "visible" : "hidden",
                    transition: isMenuOpen
                      ? "visibility 1s, line-height 1s, height 1s"
                      : "visibility 0s, line-height 0s, height 0s",
                    width: isMenuOpen ? "100px" : "0",
                    display: isMenuOpen ? "flex" : "block",
                    alignItems: "center",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                  }}
                >
                  <Typography
                    sx={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      maxWidth: "90px",
                      whiteSpace: "nowrap",
                      fontWeight: "500",
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: theme =>
                        theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                    }}
                  >
                    Dashboard
                  </Typography>
                </Box>
              </Box>
            </Button>
          )}

          <Box
            className={window.innerWidth >= 500 ? "show-on-hover" : ""}
            sx={{
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
              marginTop: "24px",
              width: "105%",
              display: window.innerWidth <= 500 ? "flex" : "none",
              justifyContent: "center",
              border: theme =>
                theme.palette.mode === "dark"
                  ? `solid 1px ${theme.palette.common.notebookG800}`
                  : `solid 1px ${theme.palette.common.gray200}`,
            }}
          >
            <Button
              sx={{
                padding: "10px",
                width: "100%",
                height: "100%",
                ":hover": {
                  background: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookO900 : theme.palette.common.primary50,
                },
              }}
              onClick={() => {
                setShouldShowTagSearcher(true);
                choosingNodeClick("ToolbarTag");
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  width: "94%",
                }}
              >
                <NextImage width={"25px"} src={TagIcon} alt="tag icon" />

                <Typography
                  sx={{
                    marginLeft: "4px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray800,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                >
                  {user.tag}
                </Typography>
              </Box>
            </Button>
          </Box>
          {shouldShowTagSearcher && (
            <Suspense fallback={<div></div>}>
              <Box
                id="tagModal"
                sx={{
                  background: "#1B1A1A",
                  paddingX: "10px",
                }}
              >
                <Modal
                  className="tagSelectorModalUserSetting"
                  onClick={closeTagSelector}
                  returnDown={false}
                  noBackground={true}
                  style={{
                    width: "441px",
                    height: "495px",
                    left: window.innerWidth <= 500 ? "28px" : "270px",
                    top: "114px",
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

          <Box
            className={window.innerWidth >= 500 ? "show-on-hover" : ""}
            sx={{
              width: "100%",
              marginTop: "5px",
              display: window.innerWidth <= 500 ? "flex" : "none",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Button
              sx={{
                display: "flex",
                justifyContent: "space-between",
                paddingY: "10px",
                paddingX: "20px",
                width: "100%",
                height: "100%",
                ":hover": {
                  background: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookO900 : theme.palette.common.primary50,
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
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray600,
                }}
              >
                {leaderBoardType ? leaderBoardType : "Leaderboard"}
              </Box>
              {leaderboardTypeOpen ? (
                <ExpandLess
                  sx={{
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray600,
                  }}
                />
              ) : (
                <ExpandMore
                  sx={{
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray600,
                  }}
                />
              )}
            </Button>
          </Box>
          <Box
            className="show-on-hover"
            sx={{
              width: "100%",
              display: "none",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "10px",
              height: "inherit",
              position: "relative",
            }}
          >
            {leaderboardTypeOpen && (
              <MultipleChoiceBtn
                sx={{
                  zIndex: 999,
                  width: "90%",
                  marginX: "auto",
                  left: "5%",
                  top: window.innerHeight >= 500 ? "0px" : undefined,
                  bottom: window.innerHeight <= 500 ? "50px" : undefined,
                  height: "173px",
                }}
                choices={choices}
                onClose={openLeaderboardTypes}
                comLeaderboardType={leaderBoardType ? leaderBoardType : "Leaderboard"}
              />
            )}
          </Box>
          <Box
            className="hide-on-hover"
            sx={{
              display: window.innerWidth <= 500 ? "none" : "block",
              width: "60%",
              margin: "auto",
              marginTop: "14px",
              marginBottom: "14px",
              borderTop: theme =>
                theme.palette.mode === "dark"
                  ? `solid 1px ${theme.palette.common.notebookG800}`
                  : `solid 1px ${theme.palette.common.gray200}`,
            }}
          />
        </Stack>

        <Stack
          spacing={"10px"}
          direction="column"
          sx={{
            // marginTop:
            //   window.innerWidth <= 500
            //     ? "110px"
            //     : ["INSTRUCTOR", "STUDENT"].includes(user.role ?? "")
            //     ? "30px"
            //     : "20px",
            height: "55%",
            overflowY: "auto",
          }}
        >
          {user?.tag && leaderBoardType && (
            <UsersStatusList
              onlineUsers={onlineUsers}
              usersOnlineStatusLoaded={usersOnlineStatusLoaded}
              usersStatus={leaderBoardType}
              nodeBookDispatch={nodeBookDispatch}
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
    userTheme,
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
    leaderboardTypeOpen,
    shouldShowTagSearcher,
    setChosenTags,
    chosenTags,
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
        width={window.innerWidth <= 500 ? "100%" : isMenuOpen ? "100%" : 80}
        hoverWidth={window.innerWidth <= 500 ? "100%" : 250}
        showCloseButton={false}
        showScrollUpButton={false}
        isMenuOpen={isMenuOpen}
        openSidebar={openSidebar}
        contentSignalState={contentSignalState}
        SidebarContent={toolbarContentMemoized}
        sx={{
          boxShadow: undefined,
        }}
      />
    </>
  );
};

export const MemoizedToolbarSidebar = React.memo(ToolbarSidebar);
