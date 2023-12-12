import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Modal,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import NextImage from "next/image";
import React, { Dispatch, SetStateAction, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AllTagsTreeView, ChosenTag, MemoizedTagsSearcher } from "@/components/TagsSearcher";
import { useNodeBook } from "@/context/NodeBookContext";
import useConfirmationDialog from "@/hooks/useConfirmDialog";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { retrieveAuthenticatedUser } from "@/lib/firestoreClient/auth";
import { Delete, Post } from "@/lib/mapApi";

// import LogoDarkMode from "../../../../../public/LogoDarkMode.svg";
import Logo from "../../../../../public/1Cademy-head.svg";
import AssistantIcon from "../../../../../public/assistant.svg";
import BookmarkIcon from "../../../../../public/bookmark.svg";
import EditIcon from "../../../../../public/edit.svg";
import GraduatedIcon from "../../../../../public/graduated.svg";
import NotebookIcon from "../../../../../public/notebooks.svg";
import NotificationIcon from "../../../../../public/notification.svg";
// import SearchIcon from "../../../../../public/search.svg";
import TagIcon from "../../../../../public/tag.svg";
import { useWindowSize } from "../../../../hooks/useWindowSize";
import { DispatchAuthActions, Reputation, ReputationSignal, User, UserTheme } from "../../../../knowledgeTypes";
import { updateNotebookTag } from "../../../../lib/firestoreClient/notebooks.serverless";
import { DESIGN_SYSTEM_COLORS } from "../../../../lib/theme/colors";
import { NO_USER_IMAGE } from "../../../../lib/utils/constants";
import { UsersStatus, UserTutorials } from "../../../../nodeBookTypes";
import { OpenLeftSidebar } from "../../../../pages/notebook";
import { Notebook, NotebookDocument } from "../../../../types";
import { Portal } from "../../../Portal";
import { CustomBadge, CustomSmallBadge } from "../../CustomBudge";
// import Modal from "../../Modal/Modal";
import { SidebarButton } from "../../SidebarButtons";
import { MemoizedUserStatusSettings } from "../../UserStatusSettings2";
import MultipleChoiceBtn from "../MultipleChoiceBtn";
import UsersStatusList from "../UsersStatusList";
import { SidebarWrapper } from "./SidebarWrapper";

const LEADERBOARD_OPTIONS: { [key in UsersStatus]: string } = {
  Weekly: "This Week Points",
  Monthly: "This Month Points",
  "All Time": "All Time Points",
  "Others Votes": "Points by Others",
  "Others Monthly": "Monthly Points by Others",
};

type MainSidebarProps = {
  notebookRef: any;
  open: boolean;
  onClose: () => void;
  reloadPermanentGrpah: any;
  user: User;
  theme: UserTheme;
  reputation: Reputation;
  setOpenSideBar: (sidebar: OpenLeftSidebar) => void;
  mapRendered: boolean;
  selectedUser: string | null;
  uncheckedNotificationsNum: number;
  bookmarkUpdatesNum: number;
  pendingProposalsNum: number;
  windowHeight: number;
  reputationSignal: ReputationSignal[];
  onlineUsers: string[];
  usersOnlineStatusLoaded: boolean;
  disableToolbar?: boolean;
  enabledToolbarElements?: string[];
  userTutorial: UserTutorials;
  dispatch: React.Dispatch<DispatchAuthActions>;
  notebooks: Notebook[];
  setNotebooks: Dispatch<SetStateAction<Notebook[]>>;
  onChangeNotebook: (notebookId: string) => void;
  selectedNotebook: string;
  openNodesOnNotebook: (notebookId: string, nodeIds: string[]) => Promise<void>;
  // setSelectedNtoebook
  // setCurrentTutorial: Dispatch<SetStateAction<TutorialKeys>>;
  onDisplayInstructorPage: () => void;
  onChangeTagOfNotebookById: (notebookId: string, data: { defaultTagId: string; defaultTagName: string }) => void;
  toolbarRef: (node?: HTMLElement | null | undefined) => void;
  isHovered: boolean;
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
  windowHeight,
  reputationSignal,
  onlineUsers,
  usersOnlineStatusLoaded,
  disableToolbar = false,
  userTutorial,
  dispatch,
  notebooks,
  setNotebooks,
  onChangeNotebook,
  selectedNotebook,
  openNodesOnNotebook,
  onDisplayInstructorPage,
  onChangeTagOfNotebookById,
  toolbarRef,
  isHovered,
}: MainSidebarProps) => {
  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const theme = useTheme();
  const { confirmIt, ConfirmDialog } = useConfirmationDialog();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMenuOpen = isMobile && nodeBookState.isMenuOpen;

  const db = getFirestore();
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const { allTags, setAllTags } = useTagsTreeView(user.tagId ? [user.tagId] : []);
  const [leaderboardTypeOpen, setLeaderboardTypeOpen] = useState<boolean>(false);
  const [displayTagSearcher, setDisplayTagSearcher] = useState<boolean>(false);
  const [displayNotebooks, setDisplayNotebooks] = useState(false);
  const [displayConversation, setDisplayConversation] = useState(false);

  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [editableNotebook, setEditableNotebook] = useState<Notebook | null>(null);
  const createNotebookButtonRef = useRef<any>(null);
  const { height } = useWindowSize();
  const [notebookTitleIsEditable, setNotebookTitleEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const displayLargeToolbar = useMemo(
    () => isHovered || isMenuOpen || editableNotebook !== null || displayTagSearcher,
    [isHovered, isMenuOpen, editableNotebook, displayTagSearcher]
  );

  const onCloseTagSearcher = () => setDisplayTagSearcher(false);

  const onRenameNotebook = () => setNotebookTitleEditable(true);

  useEffect(() => {
    if (chosenTags.length > 0 && chosenTags[0].id in allTags) {
      notebookRef.current.chosenNode = { id: chosenTags[0].id, title: chosenTags[0].title };
      nodeBookDispatch({ type: "setChosenNode", payload: { id: chosenTags[0].id, title: chosenTags[0].title } });
      onCloseTagSearcher();
    }
  }, [allTags, chosenTags, nodeBookDispatch]);

  useEffect(() => {
    const listener = (e: any) => {
      onChangeNotebook(e.detail.id);
    };
    window.addEventListener("Notebook-selection", listener);
    return () => window.removeEventListener("Notebook-selection", listener);
  }, [onChangeNotebook]);

  // this useEffect updated the defaultTag when chosen node change
  useEffect(() => {
    const setDefaultTag = async () => {
      if (!selectedNotebook) return;
      const thisNotebook = notebooks.find(cur => cur.id === selectedNotebook);
      if (!thisNotebook) return;

      if (thisNotebook.owner !== user.uname) return alert("Cant modify this tag, ask to the notebook's owner");

      if (nodeBookState.choosingNode?.id === "Tag" && nodeBookState.chosenNode) {
        const { id: nodeId, title: nodeTitle } = nodeBookState.chosenNode;
        notebookRef.current.choosingNode = null;
        notebookRef.current.chosenNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        nodeBookDispatch({ type: "setChosenNode", payload: null });
        try {
          // onChangeNotebook(selectedNotebook);
          dispatch({
            type: "setAuthUser",
            payload: { ...user, tagId: nodeId, tag: nodeTitle },
          });
          onChangeTagOfNotebookById(selectedNotebook, { defaultTagId: nodeId, defaultTagName: nodeTitle });
          setIsLoading(true);
          await Post(`/changeDefaultTag/${nodeId}`);

          await updateNotebookTag(db, selectedNotebook, { defaultTagId: nodeId, defaultTagName: nodeTitle });
          setIsLoading(false);
          let { reputation, user: userUpdated } = await retrieveAuthenticatedUser(user.userId, user.role, user.claims);
          if (!reputation) throw Error("Cant find Reputation");
          if (!userUpdated) throw Error("Cant find User");

          dispatch({ type: "setReputation", payload: reputation });
          dispatch({ type: "setAuthUser", payload: userUpdated });
          setDisplayTagSearcher(false);
        } catch (err) {
          setIsLoading(false);
          console.error(err);
        }
      }
    };
    setDefaultTag();
  }, [
    db,
    dispatch,
    nodeBookDispatch,
    nodeBookState.choosingNode?.id,
    nodeBookState.chosenNode,
    notebookRef,
    notebooks,
    onChangeNotebook,
    onChangeTagOfNotebookById,
    selectedNotebook,
    user,
  ]);

  useEffect(() => {
    const targetTag: any = user.tagId;
    setAllTags(oldAllTags => {
      const updatedTag = {
        [targetTag]: { ...oldAllTags[targetTag], checked: true },
      };
      delete oldAllTags[targetTag];
      const newAllTags: AllTagsTreeView = {
        ...updatedTag,
        ...oldAllTags,
      };

      for (let aTag in newAllTags) {
        if (aTag !== targetTag && newAllTags[aTag].checked) {
          newAllTags[aTag] = { ...newAllTags[aTag], checked: false };
        }
      }
      return newAllTags;
    });
  }, [user.tagId]);

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
      nodeBookDispatch({ type: "setChoosingNode", payload: { id: choosingNodeTag, type: null } });
    },
    [nodeBookDispatch]
  );

  const closeTagSelector = useCallback(() => {
    notebookRef.current.chosenNode = null;
    notebookRef.current.choosingNode = null;
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    nodeBookDispatch({ type: "setChoosingNode", payload: null });
    setDisplayTagSearcher(false);
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
    (SidebarType: OpenLeftSidebar, logName: string) => {
      setOpenSideBar(SidebarType);
      onOpenSidebarLog(logName);
    },
    [setOpenSideBar, onOpenSidebarLog]
  );

  const [leaderBoardType, setLeaderBoardType] = useState<UsersStatus>("Weekly");

  const changeLeaderBoard = useCallback(
    async (type: UsersStatus, username: string) => {
      setLeaderBoardType(type);
      setLeaderboardTypeOpen(false);

      await addDoc(collection(db, "userLeaderboardLog"), {
        uname: username,
        type,
        createdAt: Timestamp.fromDate(new Date()),
      });
    },
    [db]
  );

  const choices = useMemo((): { label: string; choose: any }[] => {
    if (!user) return [];

    return (Object.keys(LEADERBOARD_OPTIONS) as UsersStatus[]).map(key => ({
      label: LEADERBOARD_OPTIONS[key],
      choose: () => changeLeaderBoard(key, user.uname),
    }));
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
  const disabledInstructorButton = disableToolbar;
  const disabledLeaderboardButton = disableToolbar;
  const disableUserStatusList = disableToolbar;

  const onCreateNotebook = useCallback(async () => {
    try {
      setIsCreatingNotebook(true);
      const newNotebook: NotebookDocument = {
        owner: user.uname,
        ownerImgUrl: user.imageUrl ?? NO_USER_IMAGE,
        ownerChooseUname: Boolean(user.chooseUname),
        ownerFullName: user.fName ?? "",
        title: `notebook ${notebooks.length + 1}`,
        duplicatedFrom: "",
        isPublic: "none",
        users: [],
        usersInfo: {},
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        defaultTagId: user.tagId ?? "",
        defaultTagName: user.tag ?? "",
        type: "default",
      };
      const notebooksRef = collection(db, "notebooks");
      const docRef = await addDoc(notebooksRef, newNotebook);
      setEditableNotebook({ ...newNotebook, id: docRef.id });
      onChangeNotebook(docRef.id);
      // if (titleInputRef.current) titleInputRef.current.focus();
    } catch (error) {
      console.error("Cant create a notebook", error);
    } finally {
      setIsCreatingNotebook(false);
    }
  }, [
    db,
    notebooks.length,
    onChangeNotebook,
    user.chooseUname,
    user.fName,
    user.imageUrl,
    user.tag,
    user.tagId,
    user.uname,
  ]);

  const onUpdateNotebookTitle = useCallback(async () => {
    try {
      if (!editableNotebook) return;
      const notebooksRef = doc(db, "notebooks", editableNotebook.id);
      await updateDoc(notebooksRef, { title: editableNotebook.title });
      setEditableNotebook(null);
      setNotebookTitleEditable(false);
    } catch (err) {}
  }, [db, editableNotebook]);

  const onDuplicateNotebook = useCallback(async () => {
    try {
      if (!editableNotebook) return;
      setIsCreatingNotebook(true);

      const sameDuplications = notebooks.filter(cur => cur.duplicatedFrom === editableNotebook.id);
      const copyNotebook: NotebookDocument = {
        owner: editableNotebook.owner,
        ownerImgUrl: editableNotebook.ownerImgUrl ?? NO_USER_IMAGE,
        ownerChooseUname: Boolean(user.chooseUname),
        ownerFullName: user.fName ?? "",
        title: `${editableNotebook.title} (${sameDuplications.length + 2})`,
        duplicatedFrom: editableNotebook.id,
        isPublic: editableNotebook.isPublic,
        users: [],
        usersInfo: {},
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        defaultTagId: user.tagId ?? "",
        defaultTagName: user.tag ?? "",
        type: editableNotebook.type ?? "default",
      };
      const notebooksRef = collection(db, "notebooks");
      const docRef = await addDoc(notebooksRef, copyNotebook);
      setEditableNotebook({ ...copyNotebook, id: docRef.id });
      // onChangeNotebook(docRef.id);
      const q = query(
        collection(db, "userNodes"),
        where("user", "==", editableNotebook.owner),
        where("notebooks", "array-contains", editableNotebook.id),
        where("deleted", "==", false)
      );
      const userNodesDocs = await getDocs(q);
      const nodeIds: string[] = [];
      userNodesDocs.forEach(doc => nodeIds.push(doc.data().node));
      await openNodesOnNotebook(docRef.id, nodeIds);
      // if (titleInputRef.current) titleInputRef.current.focus();
    } catch (error) {
      console.error("Cant duplicate a notebook", error);
    } finally {
      setIsCreatingNotebook(false);
    }
  }, [db, editableNotebook, notebooks, openNodesOnNotebook, user.chooseUname, user.fName, user.tag, user.tagId]);

  const onCopyNotebookUrl = useCallback(() => {
    if (!editableNotebook) return;
    const url = `${window.location.origin}/notebooks/${encodeURIComponent(editableNotebook.title)}/${
      editableNotebook.id
    }`;
    navigator.clipboard.writeText(url);
    setEditableNotebook(null);
    setNotebookTitleEditable(false);
  }, [editableNotebook]);

  const onDeleteNotebook = useCallback(async () => {
    try {
      if (!editableNotebook) return;

      if (!(await confirmIt("Are you sure to delete notebook", "Delete Notebook", "Keep Notebook"))) return;
      setNotebooks(prevNotebooks => {
        const newNotebooks = prevNotebooks.filter(cur => cur.id !== editableNotebook.id);
        onChangeNotebook(newNotebooks[0]?.id ?? "");
        return newNotebooks;
      });
      setEditableNotebook(null);
      setNotebookTitleEditable(false);
      await Delete("/notebooks/delete", { notebookId: editableNotebook.id });
      // onChangeNotebook("");
    } catch (error) {
      console.error("Cant remove notebook", error);
    } finally {
      setIsCreatingNotebook(false);
    }
  }, [editableNotebook, onChangeNotebook, setNotebooks]);

  const onOpenUserInfo = useCallback(() => {
    if (!editableNotebook) return;

    nodeBookDispatch({
      type: "setSelectedUser",
      payload: {
        username: editableNotebook.owner,
        imageUrl: editableNotebook.ownerImgUrl,
        fullName: editableNotebook.ownerFullName,
        chooseUname: editableNotebook.ownerChooseUname,
      },
    });
    setOpenSideBar("USER_INFO");
    const userUserInfoCollection = collection(db, "userUserInfoLog");
    addDoc(userUserInfoCollection, {
      uname: user.uname,
      uInfo: editableNotebook.owner,
      createdAt: Timestamp.fromDate(new Date()),
    });
    setEditableNotebook(null);
    setNotebookTitleEditable(false);
  }, [db, editableNotebook, nodeBookDispatch, setOpenSideBar, user.uname]);

  useEffect(() => {
    if (!displayLargeToolbar) {
      setDisplayNotebooks(false);
      setLeaderboardTypeOpen(false);
    }
  }, [displayLargeToolbar]);

  const openConversations = (e: any) => {
    e.preventDefault();
    setDisplayConversation(displayConversation => !displayConversation);
    setDisplayNotebooks(false);
  };
  const openNotebooks = (e: any) => {
    e.preventDefault();
    setDisplayNotebooks(displayNotebooks => !displayNotebooks);
    setDisplayConversation(false);
  };

  const toolbarContentMemoized = useMemo(() => {
    return (
      <Box
        id="toolbar"
        className={`toolbar ${isMenuOpen ? "toolbar-opened" : ""}`}
        ref={toolbarRef}
        sx={{
          minHeight: "100%",
          width: "inherit",
          overflow: "hidden",
          display: { xs: isMenuOpen ? "grid" : "none", sm: "grid" },
          gridTemplateRows: "auto auto  1fr",
          background: ({ palette }) =>
            palette.mode === "dark" ? palette.common.notebookMainBlack : palette.common.gray50,
        }}
      >
        <Stack alignItems="center" direction="column" sx={{ width: "inherit", px: "16px" }}>
          <Box
            sx={{
              mt: "10px",
              mb: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "64px",
            }}
          >
            {<img src={Logo.src} alt="onecademy logo" width={"auto"} height={"52px"} />}
            {displayLargeToolbar && (
              <svg
                width="118"
                height="33"
                viewBox="0 0 115 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginLeft: "16px" }}
              >
                <path
                  d="M0.83025 23.096C0.680917 23.096 0.563583 23.0533 0.47825 22.968C0.392917 22.8827 0.35025 22.7973 0.35025 22.712C0.35025 22.52 0.51025 22.3813 0.83025 22.296C1.64092 22.0827 2.30225 21.8907 2.81425 21.72C3.34758 21.528 3.73158 21.272 3.96625 20.952C4.22225 20.6107 4.35025 20.1307 4.35025 19.512V7.288C4.35025 6.88267 4.22225 6.57333 3.96625 6.36C3.71025 6.14667 3.37958 5.99733 2.97425 5.912C2.56892 5.82667 2.13158 5.77333 1.66225 5.752C1.44892 5.73067 1.25692 5.67733 1.08625 5.592C0.915584 5.50667 0.83025 5.37867 0.83025 5.208C0.83025 5.05867 0.904917 4.93067 1.05425 4.824C1.22492 4.71733 1.41692 4.65333 1.63025 4.632C2.59025 4.48267 3.44358 4.30133 4.19025 4.088C4.95825 3.85333 5.70492 3.37333 6.43025 2.648C6.45158 2.62667 6.47292 2.616 6.49425 2.616C6.53692 2.616 6.56892 2.616 6.59025 2.616C6.69692 2.616 6.79292 2.648 6.87825 2.712C6.96358 2.75467 6.99558 2.81867 6.97425 2.904C6.93158 3.224 6.89958 3.576 6.87825 3.96C6.85692 4.32267 6.84625 4.728 6.84625 5.176V19.896C6.84625 20.4293 6.94225 20.8347 7.13425 21.112C7.34758 21.3893 7.69958 21.6133 8.19025 21.784C8.68092 21.9333 9.36358 22.1147 10.2383 22.328C10.3663 22.3493 10.4836 22.4027 10.5903 22.488C10.7183 22.552 10.7823 22.6373 10.7823 22.744C10.7823 22.9787 10.6329 23.096 10.3343 23.096C9.73692 23.096 9.18225 23.0747 8.67025 23.032C8.17958 23.0107 7.68892 22.9893 7.19825 22.968C6.72892 22.9467 6.20625 22.936 5.63025 22.936C5.05425 22.936 4.51025 22.9467 3.99825 22.968C3.48625 22.9893 2.97425 23.0107 2.46225 23.032C1.95025 23.0747 1.40625 23.096 0.83025 23.096ZM25.8053 23.48C24.3119 23.48 22.8719 23.224 21.4853 22.712C20.0986 22.2 18.8613 21.4747 17.7733 20.536C16.6853 19.576 15.8213 18.4347 15.1813 17.112C14.5626 15.768 14.2533 14.2853 14.2533 12.664C14.2533 11.1067 14.5839 9.66667 15.2453 8.344C15.9066 7.02133 16.8133 5.86933 17.9653 4.888C19.1173 3.90667 20.4293 3.14933 21.9013 2.616C23.3946 2.06133 24.9626 1.784 26.6053 1.784C27.4373 1.784 28.1413 1.816 28.7173 1.88C29.2933 1.944 29.8479 2.04 30.3813 2.168C30.9359 2.27467 31.5759 2.424 32.3013 2.616C32.6213 2.70133 32.8453 2.82933 32.9733 3C33.1226 3.17067 33.2079 3.40533 33.2293 3.704C33.2719 4.19467 33.3253 4.728 33.3893 5.304C33.4533 5.85867 33.4959 6.552 33.5173 7.384C33.5386 7.53333 33.4639 7.66133 33.2933 7.768C33.1439 7.85333 32.9733 7.87467 32.7812 7.832C32.6106 7.78933 32.4933 7.65067 32.4293 7.416C32.2159 6.60533 31.9706 5.912 31.6933 5.336C31.4159 4.73867 30.9999 4.248 30.4453 3.864C29.9119 3.50133 29.2613 3.23467 28.4933 3.064C27.7466 2.872 26.9359 2.776 26.0613 2.776C24.8239 2.776 23.6719 3.032 22.6053 3.544C21.5599 4.03467 20.6533 4.71733 19.8853 5.592C19.1386 6.44533 18.5519 7.416 18.1253 8.504C17.6986 9.592 17.4852 10.7227 17.4852 11.896C17.4852 13.1973 17.6879 14.4773 18.0933 15.736C18.5199 16.9947 19.1173 18.136 19.8853 19.16C20.6746 20.1627 21.6026 20.9733 22.6693 21.592C23.7573 22.1893 24.9626 22.488 26.2853 22.488C27.8213 22.488 29.0906 22.136 30.0933 21.432C31.0959 20.728 31.9493 19.7467 32.6533 18.488C32.8026 18.2107 33.0159 18.072 33.2933 18.072C33.5919 18.072 33.7413 18.2427 33.7413 18.584C33.7413 18.7547 33.6986 19.032 33.6133 19.416C33.5279 19.7787 33.4106 20.1733 33.2613 20.6C33.1333 21.0053 33.0053 21.368 32.8773 21.688C32.7279 21.9867 32.5999 22.1787 32.4933 22.264C32.4079 22.3493 32.1946 22.4453 31.8533 22.552C31.0639 22.872 30.1146 23.1067 29.0053 23.256C27.9173 23.4053 26.8506 23.48 25.8053 23.48ZM39.244 23.448C38.86 23.448 38.4653 23.2987 38.06 23C37.676 22.7013 37.3453 22.3387 37.068 21.912C36.812 21.4853 36.684 21.08 36.684 20.696C36.684 20.0133 36.8653 19.48 37.228 19.096C37.5907 18.712 38.1667 18.36 38.956 18.04L42.22 16.696C42.6467 16.5253 42.892 16.376 42.956 16.248C43.0413 16.12 43.0947 15.8427 43.116 15.416L43.18 13.368C43.2013 12.8133 43.0413 12.3333 42.7 11.928C42.38 11.5227 41.9107 11.32 41.292 11.32C40.972 11.32 40.652 11.3733 40.332 11.48C40.012 11.5867 39.7453 11.7253 39.532 11.896C39.404 11.9813 39.3187 12.1093 39.276 12.28C39.2333 12.4507 39.212 12.632 39.212 12.824C39.212 12.9093 39.212 13.0053 39.212 13.112C39.2333 13.2187 39.244 13.3147 39.244 13.4C39.244 13.5067 39.1053 13.656 38.828 13.848C38.572 14.0187 38.2733 14.1787 37.932 14.328C37.612 14.456 37.3453 14.52 37.132 14.52C37.0253 14.52 36.94 14.4987 36.876 14.456C36.812 14.392 36.78 14.3173 36.78 14.232C36.78 13.8907 36.8867 13.528 37.1 13.144C37.3347 12.7387 37.6547 12.3653 38.06 12.024C38.5507 11.576 39.084 11.1813 39.66 10.84C40.236 10.4987 40.8013 10.232 41.356 10.04C41.9107 9.848 42.4013 9.752 42.828 9.752C43.596 9.752 44.2253 10.0293 44.716 10.584C45.228 11.1173 45.4733 11.7893 45.452 12.6L45.292 20.28C45.2707 20.728 45.3667 21.0907 45.58 21.368C45.8147 21.6453 46.1027 21.784 46.444 21.784C46.9773 21.784 47.372 21.6667 47.628 21.432C47.7347 21.3253 47.82 21.272 47.884 21.272C47.9907 21.272 48.076 21.304 48.14 21.368C48.204 21.432 48.236 21.5173 48.236 21.624C48.236 21.8587 48.1187 22.0933 47.884 22.328C47.5427 22.6693 47.1693 22.936 46.764 23.128C46.38 23.3413 46.0173 23.448 45.676 23.448C44.6947 23.448 43.916 22.8933 43.34 21.784H43.244C42.54 22.36 41.868 22.776 41.228 23.032C40.588 23.3093 39.9267 23.448 39.244 23.448ZM40.748 21.912C41.1747 21.912 41.5373 21.848 41.836 21.72C42.1347 21.5707 42.4013 21.3787 42.636 21.144C42.7427 21.0373 42.828 20.8987 42.892 20.728C42.9773 20.536 43.0307 20.2373 43.052 19.832L43.116 18.264C43.1373 18.0293 43.1267 17.8587 43.084 17.752C43.0413 17.6453 42.956 17.592 42.828 17.592C42.7853 17.592 42.7107 17.6027 42.604 17.624C42.4973 17.6453 42.3587 17.688 42.188 17.752C41.0573 18.1573 40.268 18.584 39.82 19.032C39.3933 19.4587 39.18 19.8533 39.18 20.216C39.18 20.7707 39.34 21.1973 39.66 21.496C40.0013 21.7733 40.364 21.912 40.748 21.912ZM59.7053 23.608C59.6626 23.608 59.5879 23.5653 59.4813 23.48C59.3959 23.3947 59.3533 23.3307 59.3533 23.288C59.3533 23.0747 59.3746 22.776 59.4173 22.392C59.4813 21.9867 59.5133 21.6453 59.5133 21.368V21.176C59.1933 21.6667 58.6813 22.168 57.9773 22.68C57.2733 23.192 56.3879 23.448 55.3213 23.448C54.1053 23.448 53.0493 23.128 52.1533 22.488C51.2786 21.848 50.5959 21.0267 50.1053 20.024C49.6359 19.0213 49.4013 17.9867 49.4013 16.92C49.4013 15.6827 49.6893 14.52 50.2653 13.432C50.8413 12.344 51.6626 11.4587 52.7293 10.776C53.8173 10.0933 55.1079 9.752 56.6013 9.752C57.0279 9.752 57.4546 9.79467 57.8813 9.88C58.3293 9.944 58.6706 10.0187 58.9053 10.104C59.0973 10.168 59.2359 10.2 59.3213 10.2C59.4706 10.2 59.5453 9.944 59.5453 9.432V4.888C59.5453 4.01333 59.4066 3.42666 59.1293 3.128C58.8519 2.82933 58.4573 2.63733 57.9453 2.552C57.7533 2.50933 57.6573 2.37067 57.6573 2.136C57.6573 1.944 57.7426 1.816 57.9133 1.752C58.8519 1.51733 59.5879 1.29333 60.1213 1.08C60.6546 0.866665 61.0706 0.695999 61.3693 0.567999C61.4546 0.525333 61.5293 0.504 61.5933 0.504C61.6786 0.482665 61.7426 0.471998 61.7853 0.471998C61.9133 0.471998 61.9879 0.535999 62.0093 0.664C62.0093 0.791999 61.9879 1.016 61.9453 1.336C61.9239 1.63467 61.8919 2.08267 61.8493 2.68C61.8066 3.27733 61.7853 4.056 61.7853 5.016V19.48C61.7853 20.2053 61.8386 20.7387 61.9453 21.08C62.0519 21.4 62.2226 21.56 62.4573 21.56C62.5639 21.56 62.7453 21.5493 63.0013 21.528C63.2786 21.5067 63.5559 21.4853 63.8333 21.464C64.2173 21.4427 64.4093 21.5387 64.4093 21.752C64.4093 21.9013 64.3559 22.04 64.2493 22.168C64.1639 22.2747 64.0679 22.328 63.9613 22.328C63.3639 22.4133 62.7773 22.5413 62.2013 22.712C61.6253 22.8613 60.9639 23.096 60.2173 23.416C60.0466 23.5013 59.9293 23.5547 59.8653 23.576C59.8226 23.5973 59.7693 23.608 59.7053 23.608ZM56.4733 21.784C57.0279 21.784 57.5719 21.6453 58.1053 21.368C58.6386 21.0693 59.1079 20.6853 59.5133 20.216L59.5453 14.456C59.5453 13.88 59.3746 13.3147 59.0333 12.76C58.7133 12.2053 58.2546 11.7573 57.6573 11.416C57.0813 11.0533 56.3986 10.872 55.6093 10.872C55.1186 10.872 54.5639 11.0213 53.9453 11.32C53.3266 11.6187 52.7933 12.152 52.3453 12.92C51.8973 13.6667 51.6733 14.7547 51.6733 16.184C51.6733 17.4 51.8546 18.3813 52.2173 19.128C52.5799 19.8533 53.0173 20.408 53.5293 20.792C54.0626 21.176 54.5959 21.4427 55.1293 21.592C55.6839 21.72 56.1319 21.784 56.4733 21.784ZM71.2848 23.48C70.1114 23.48 69.0874 23.192 68.2128 22.616C67.3381 22.04 66.6554 21.2293 66.1648 20.184C65.6741 19.1173 65.4288 17.8907 65.4288 16.504C65.4288 15.2667 65.7061 14.1467 66.2608 13.144C66.8368 12.12 67.5941 11.2987 68.5328 10.68C69.4714 10.0613 70.4954 9.752 71.6048 9.752C72.4581 9.752 73.2154 9.92267 73.8767 10.264C74.5381 10.6053 75.0501 11.0853 75.4128 11.704C75.7968 12.3013 75.9888 12.9947 75.9888 13.784C75.9888 14.4453 75.6688 14.776 75.0288 14.776H68.2768C67.9781 14.776 67.7648 14.8613 67.6368 15.032C67.5301 15.1813 67.4768 15.4907 67.4768 15.96C67.4768 16.984 67.7008 17.9227 68.1488 18.776C68.5968 19.608 69.1941 20.28 69.9408 20.792C70.6874 21.2827 71.5088 21.528 72.4048 21.528C73.0448 21.528 73.6208 21.4107 74.1328 21.176C74.6661 20.92 75.1354 20.5573 75.5408 20.088C75.6261 19.9813 75.6901 19.9173 75.7328 19.896C75.7754 19.8533 75.8288 19.832 75.8928 19.832C76.0634 19.832 76.1488 19.9387 76.1488 20.152C76.1488 20.5573 75.9568 21.0053 75.5728 21.496C75.2528 21.9013 74.8688 22.2533 74.4208 22.552C73.9728 22.8507 73.4821 23.0747 72.9488 23.224C72.4154 23.3947 71.8608 23.48 71.2848 23.48ZM68.3408 13.784H71.2528C71.7648 13.784 72.2021 13.7733 72.5648 13.752C72.9274 13.7307 73.2794 13.688 73.6208 13.624C73.7274 13.6027 73.7914 13.5387 73.8128 13.432C73.8554 13.304 73.8767 13.1333 73.8767 12.92C73.8767 12.3013 73.5994 11.7787 73.0448 11.352C72.5114 10.904 71.8714 10.68 71.1248 10.68C70.6341 10.68 70.1434 10.8293 69.6528 11.128C69.1621 11.4053 68.7568 11.7573 68.4368 12.184C68.1168 12.6107 67.9568 13.0373 67.9568 13.464C67.9568 13.6773 68.0848 13.784 68.3408 13.784ZM78.3455 23.096C78.1748 23.096 78.0255 23.0747 77.8975 23.032C77.7695 22.9893 77.7055 22.8933 77.7055 22.744C77.7055 22.5947 77.7695 22.488 77.8975 22.424C78.0468 22.36 78.2282 22.296 78.4415 22.232C78.7402 22.1253 79.0388 22.008 79.3375 21.88C79.6575 21.7307 79.8175 21.4427 79.8175 21.016V14.136C79.8175 13.56 79.7535 13.0587 79.6255 12.632C79.4975 12.184 79.1562 11.9173 78.6015 11.832C78.5162 11.8107 78.4415 11.768 78.3775 11.704C78.3348 11.64 78.3135 11.544 78.3135 11.416C78.3135 11.2027 78.3988 11.0747 78.5695 11.032C79.1455 10.8827 79.6042 10.7333 79.9455 10.584C80.2868 10.4133 80.5855 10.232 80.8415 10.04C81.1188 9.82667 81.4495 9.60267 81.8335 9.368C81.8762 9.34667 81.9188 9.32533 81.9615 9.304C82.0042 9.26133 82.0575 9.24 82.1215 9.24C82.2495 9.24 82.3135 9.31467 82.3135 9.464C82.3135 9.61333 82.2815 9.92267 82.2175 10.392C82.1748 10.84 82.1535 11.2133 82.1535 11.512C82.1535 11.7253 82.1748 11.8533 82.2175 11.896H82.2815C82.7722 11.4267 83.4122 10.9573 84.2015 10.488C85.0122 9.99733 86.0362 9.752 87.2735 9.752C88.0415 9.752 88.6815 9.92267 89.1935 10.264C89.7055 10.584 90.1322 11.1493 90.4735 11.96H90.5695C91.2522 11.3413 92.0308 10.8187 92.9055 10.392C93.7802 9.96533 94.7402 9.752 95.7855 9.752C96.4895 9.752 97.0762 9.96533 97.5455 10.392C98.0148 10.8187 98.3668 11.3733 98.6015 12.056C98.8575 12.7387 98.9855 13.4533 98.9855 14.2V21.016C98.9855 21.4427 99.1348 21.7307 99.4335 21.88C99.7322 22.008 100.042 22.1253 100.362 22.232C100.575 22.296 100.746 22.36 100.874 22.424C101.023 22.488 101.098 22.5947 101.098 22.744C101.098 22.872 101.044 22.9573 100.938 23C100.852 23.064 100.692 23.096 100.458 23.096C100.031 23.096 99.7002 23.0747 99.4655 23.032C99.2308 23.0107 99.0068 22.9893 98.7935 22.968C98.6015 22.9467 98.3135 22.936 97.9295 22.936C97.5668 22.936 97.2682 22.9467 97.0335 22.968C96.7988 22.9893 96.5535 23.0107 96.2975 23.032C96.0415 23.0747 95.7002 23.096 95.2735 23.096C95.0815 23.096 94.9215 23.064 94.7935 23C94.6868 22.9573 94.6335 22.872 94.6335 22.744C94.6335 22.5733 94.6975 22.456 94.8255 22.392C94.9748 22.328 95.1562 22.2747 95.3695 22.232C95.7108 22.1467 96.0202 22.0293 96.2975 21.88C96.5962 21.7307 96.7455 21.4427 96.7455 21.016V14.296C96.7455 13.784 96.6282 13.304 96.3935 12.856C96.1588 12.3867 95.8495 12.0027 95.4655 11.704C95.0815 11.4053 94.6548 11.256 94.1855 11.256C93.6522 11.256 93.1508 11.32 92.6815 11.448C92.2335 11.576 91.8068 11.8 91.4015 12.12C90.8042 12.5893 90.5055 13.3573 90.5055 14.424V21.016C90.5055 21.4427 90.6655 21.7307 90.9855 21.88C91.3055 22.0293 91.6255 22.1467 91.9455 22.232C92.1588 22.2747 92.3295 22.3387 92.4575 22.424C92.6068 22.488 92.6815 22.5947 92.6815 22.744C92.6815 22.872 92.6282 22.9573 92.5215 23C92.4148 23.064 92.2548 23.096 92.0415 23.096C91.6148 23.096 91.2735 23.0747 91.0175 23.032C90.7828 23.0107 90.5482 22.9893 90.3135 22.968C90.1002 22.9467 89.8015 22.936 89.4175 22.936C89.0548 22.936 88.7562 22.9467 88.5215 22.968C88.2868 22.9893 88.0415 23.0107 87.7855 23.032C87.5295 23.0747 87.1882 23.096 86.7615 23.096C86.5908 23.096 86.4415 23.064 86.3135 23C86.1855 22.9573 86.1215 22.872 86.1215 22.744C86.1215 22.5733 86.1962 22.4667 86.3455 22.424C86.5162 22.36 86.6868 22.296 86.8575 22.232C87.1775 22.1253 87.4868 22.008 87.7855 21.88C88.1055 21.7307 88.2655 21.4427 88.2655 21.016V14.296C88.2655 13.784 88.1482 13.304 87.9135 12.856C87.6788 12.3867 87.3695 12.0027 86.9855 11.704C86.6015 11.4053 86.1748 11.256 85.7055 11.256C85.1722 11.256 84.6708 11.32 84.2015 11.448C83.7535 11.576 83.3268 11.8 82.9215 12.12C82.3455 12.5467 82.0575 13.3147 82.0575 14.424V21.016C82.0575 21.4427 82.2068 21.7307 82.5055 21.88C82.8042 22.008 83.1135 22.1253 83.4335 22.232C83.6042 22.296 83.7642 22.36 83.9135 22.424C84.0842 22.4667 84.1695 22.5733 84.1695 22.744C84.1695 22.872 84.1055 22.9573 83.9775 23C83.8708 23.064 83.7215 23.096 83.5295 23.096C83.1028 23.096 82.7615 23.0747 82.5055 23.032C82.2708 23.0107 82.0468 22.9893 81.8335 22.968C81.6202 22.9467 81.3215 22.936 80.9375 22.936C80.5748 22.936 80.2762 22.9467 80.0415 22.968C79.8282 22.9893 79.5935 23.0107 79.3375 23.032C79.1028 23.0747 78.7722 23.096 78.3455 23.096ZM102.611 32.12C102.205 32.12 101.832 32.0133 101.491 31.8C101.149 31.608 100.979 31.2773 100.979 30.808C100.979 30.424 101.064 30.0827 101.235 29.784C101.427 29.5067 101.693 29.368 102.035 29.368C102.269 29.368 102.493 29.4 102.707 29.464C102.941 29.528 103.144 29.56 103.315 29.56C103.443 29.56 103.549 29.528 103.635 29.464C103.741 29.4213 103.837 29.336 103.923 29.208C104.157 28.824 104.424 28.344 104.723 27.768C105.043 27.192 105.363 26.5413 105.683 25.816C106.024 25.0907 106.344 24.3227 106.643 23.512C106.707 23.32 106.739 23.0747 106.739 22.776C106.739 22.6053 106.728 22.4453 106.707 22.296C106.685 22.1253 106.653 21.976 106.611 21.848L102.899 12.472C102.749 12.088 102.547 11.7573 102.291 11.48C102.056 11.1813 101.779 10.9893 101.459 10.904C101.288 10.84 101.117 10.7653 100.947 10.68C100.797 10.5947 100.723 10.4773 100.723 10.328C100.723 10.2 100.797 10.1253 100.947 10.104C101.117 10.0613 101.256 10.04 101.363 10.04C101.789 10.04 102.099 10.0507 102.291 10.072C102.504 10.0933 102.696 10.1253 102.867 10.168C103.059 10.1893 103.336 10.2 103.699 10.2C104.083 10.2 104.371 10.1893 104.562 10.168C104.755 10.1253 104.957 10.0933 105.171 10.072C105.384 10.0507 105.704 10.04 106.131 10.04C106.259 10.04 106.397 10.072 106.547 10.136C106.696 10.1787 106.771 10.264 106.771 10.392C106.771 10.5413 106.653 10.6907 106.419 10.84C106.205 10.968 106.013 11.0533 105.843 11.096C105.629 11.16 105.469 11.2773 105.363 11.448C105.256 11.5973 105.203 11.8213 105.203 12.12C105.203 12.248 105.235 12.408 105.299 12.6C105.363 12.7707 105.416 12.9093 105.459 13.016L108.051 19.416C108.093 19.544 108.157 19.608 108.243 19.608C108.307 19.608 108.36 19.544 108.403 19.416L110.611 13.56C110.675 13.4107 110.728 13.2187 110.771 12.984C110.835 12.728 110.867 12.5253 110.867 12.376C110.867 11.9707 110.803 11.6933 110.675 11.544C110.568 11.3733 110.419 11.2453 110.227 11.16C110.056 11.0747 109.853 10.968 109.619 10.84C109.405 10.6907 109.299 10.5413 109.299 10.392C109.299 10.264 109.373 10.1787 109.523 10.136C109.693 10.072 109.832 10.04 109.939 10.04C110.237 10.04 110.536 10.072 110.835 10.136C111.155 10.1787 111.613 10.2 112.211 10.2C112.616 10.2 112.904 10.1893 113.075 10.168C113.267 10.1253 113.427 10.0933 113.555 10.072C113.683 10.0507 113.864 10.04 114.099 10.04C114.205 10.04 114.333 10.0613 114.483 10.104C114.653 10.1253 114.739 10.2 114.739 10.328C114.739 10.4773 114.653 10.5947 114.483 10.68C114.333 10.7653 114.173 10.84 114.003 10.904C113.683 10.9893 113.341 11.2453 112.979 11.672C112.616 12.0773 112.328 12.536 112.115 13.048L107.763 23.416C107.741 23.48 107.624 23.7573 107.411 24.248C107.219 24.7387 106.973 25.3467 106.675 26.072C106.376 26.7973 106.045 27.576 105.683 28.408C105.341 29.24 105.011 30.04 104.691 30.808C104.499 31.2347 104.221 31.5547 103.859 31.768C103.496 32.0027 103.08 32.12 102.611 32.12Z"
                  fill="#F37F2F"
                />
              </svg>
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
            completeVersion={displayLargeToolbar}
          />

          <Stack
            alignItems="center"
            direction="column"
            spacing={"4px"}
            sx={{ width: "inherit", px: "16px", mt: "14px" }}
          >
            {/* Searcher button */}

            <SidebarButton
              id="toolbar-search-button"
              iconSrc={""}
              icon={<SearchIcon sx={{ color: DESIGN_SYSTEM_COLORS.baseWhite }} />}
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
              rightFloatingOption={<CustomSmallBadge value={uncheckedNotificationsNum} />}
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
              rightFloatingOption={<CustomSmallBadge value={bookmarkUpdatesNum} />}
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
              rightFloatingOption={<CustomSmallBadge value={pendingProposalsNum} />}
            />

            <SidebarButton
              id="toolbar-pending-proposal-button"
              iconSrc={EditIcon}
              onClick={() => {
                onOpenSidebar("CHAT", "chat");
                setIsMenuOpen(false);
              }}
              text="Chat"
              toolbarIsOpen={displayLargeToolbar}
              rightOption={<CustomBadge value={pendingProposalsNum} />}
              rightFloatingOption={<CustomSmallBadge value={pendingProposalsNum} />}
            />

            {/* dashboard */}
            {["INSTRUCTOR", "STUDENT"].includes(user.role ?? "") && (
              <SidebarButton
                id="toolbar-dashboard-button"
                iconSrc={GraduatedIcon}
                onClick={onDisplayInstructorPage}
                text="Dashboard"
                toolbarIsOpen={displayLargeToolbar}
              />
            )}

            {/* notebooks */}
            <SidebarButton
              id="toolbar-notebooks-button"
              iconSrc={NotebookIcon}
              onClick={openNotebooks}
              text="Notebooks"
              toolbarIsOpen={displayLargeToolbar}
              rightOption={
                <KeyboardArrowDownIcon
                  sx={{
                    transition: ".3s",
                    rotate: displayNotebooks ? "180deg" : "0deg",
                    color: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray800,
                  }}
                />
              }
            />
            {displayNotebooks && displayLargeToolbar && (
              <Box sx={{ width: "100%" }}>
                <Stack className="scroll-styled" sx={{ width: "100%", maxHeight: "126px", overflowY: "auto" }}>
                  {notebooks
                    .filter(n => !n.conversation)
                    .sort((a, b) => {
                      if (a.id === selectedNotebook) {
                        return -1;
                      } else if (b.id === selectedNotebook) {
                        return 1;
                      } else {
                        return 0;
                      }
                    })
                    .map((cur, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: "10px 16px 10px 27px",
                          height: "42px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                        }}
                      >
                        {/* min-width is making ellipsis works correctly */}
                        <Box
                          onClick={() => onChangeNotebook(cur.id)}
                          sx={{ minWidth: "0px", display: "flex", alignItems: "center" }}
                        >
                          <Box sx={{ minWidth: "0px", display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                background: selectedNotebook === cur.id ? DESIGN_SYSTEM_COLORS.success500 : "none",
                                minWidth: "10px",
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                mr: "10px",
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: ({ palette }) =>
                                  palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray800,
                              }}
                            >
                              {cur.title}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton onClick={() => setEditableNotebook(cur)} sx={{ p: "0px" }}>
                          <MoreVertIcon sx={{ fontSize: "16px" }} />
                        </IconButton>
                      </Box>
                    ))}
                </Stack>

                <Divider ref={createNotebookButtonRef} sx={{ width: "162px", float: "right" }} />

                <Box sx={{ p: "6px 8px", mt: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isCreatingNotebook ? (
                    <Box>
                      <Typography sx={{ fontSize: "14px" }}>Creating...</Typography>
                    </Box>
                  ) : (
                    <Box onClick={onCreateNotebook} sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <Box
                        sx={{
                          width: "20px",
                          height: "20px",
                          p: "0px",
                          borderRadius: "5px",
                          backgroundColor: ({ palette }) => (palette.mode === "dark" ? "#55402B66" : "#E7724033"),
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <AddIcon
                          sx={{
                            fontSize: "14px",
                            color: ({ palette }) =>
                              palette.mode === "dark" ? palette.common.primary800 : palette.common.orange400,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ ml: "10px", fontSize: "14px" }}>Create New</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {notebooks.filter(n => n.hasOwnProperty("conversation")).length > 0 && (
              <SidebarButton
                id="toolbar-converstaions-button"
                iconSrc={AssistantIcon}
                onClick={openConversations}
                text="Conversations"
                toolbarIsOpen={displayLargeToolbar}
                rightOption={
                  <KeyboardArrowDownIcon
                    sx={{
                      transition: ".3s",
                      rotate: displayConversation ? "180deg" : "0deg",
                      color: theme =>
                        theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray800,
                    }}
                  />
                }
              />
            )}
            {displayConversation && displayLargeToolbar && (
              <Box sx={{ width: "100%" }}>
                <Stack className="scroll-styled" sx={{ width: "100%", maxHeight: "126px", overflowY: "auto" }}>
                  {notebooks
                    .filter(n => n.hasOwnProperty("conversation"))
                    .sort((a, b) => {
                      if (a.id === selectedNotebook) {
                        return -1;
                      } else if (b.id === selectedNotebook) {
                        return 1;
                      } else {
                        return 0;
                      }
                    })
                    .map((cur, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: "10px 16px 10px 27px",
                          height: "42px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                        }}
                      >
                        {/* min-width is making ellipsis works correctly */}
                        <Box
                          onClick={() => onChangeNotebook(cur.id)}
                          sx={{ minWidth: "0px", display: "flex", alignItems: "center" }}
                        >
                          <Box sx={{ minWidth: "0px", display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                background: selectedNotebook === cur.id ? DESIGN_SYSTEM_COLORS.success500 : "none",
                                minWidth: "10px",
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                mr: "10px",
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: ({ palette }) =>
                                  palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray800,
                              }}
                            >
                              {cur.title}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton onClick={() => setEditableNotebook(cur)} sx={{ p: "0px" }}>
                          <MoreVertIcon sx={{ fontSize: "16px" }} />
                        </IconButton>
                      </Box>
                    ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Stack>

        {/* --------------- */}

        {displayLargeToolbar && (
          <Button
            sx={{
              mt: "14px",
              p: "11px 16px",
              width: "100%",
              height: "40px",
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.gray100,
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray200,
              borderLeft: "none",
              borderRight: "none",
              borderRadius: "0px",
              ":hover": {
                background: theme => (theme.palette.mode === "dark" ? "#55402B" : "#FFE2D0"),
              },
            }}
            onClick={() => {
              setDisplayTagSearcher(true);
              choosingNodeClick("Tag");
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
                {isLoading && <LinearProgress />}
              </Typography>
            </Box>
          </Button>
        )}

        <Portal anchor="portal">
          {editableNotebook && (
            <ClickAwayListener onClickAway={onUpdateNotebookTitle}>
              <Box
                sx={{
                  width: "263px",
                  position: "absolute",
                  top: `${height / 2 - 200}px`,
                  left: "240px",
                  zIndex: 10000,
                  backgroundColor: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray850 : theme.palette.common.gray50,
                  borderRadius: "8px",
                }}
              >
                <Stack direction={"row"} alignItems="center" sx={{ p: "14px 12px" }}>
                  {notebookTitleIsEditable ? (
                    <TextField
                      autoFocus
                      // ref={titleInputRef}
                      id="notebook-title"
                      label=""
                      variant="outlined"
                      onKeyDown={e => {
                        if (e.code === "Enter" || e.keyCode === 13) {
                          onUpdateNotebookTitle();
                          e.stopPropagation();
                        }
                      }}
                      value={editableNotebook.title}
                      onChange={e => setEditableNotebook(prev => (prev ? { ...prev, title: e.target.value } : null))}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => onUpdateNotebookTitle()} sx={{ p: "4px" }}>
                              <CheckIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: { p: "10px 14px", fontSize: "18px", fontWeight: "bold" },
                      }}
                      inputProps={{ sx: {} }}
                      sx={{
                        border: "solid 1px pink",
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.primary600
                              : theme.palette.common.primary600,
                          boxShadow: theme =>
                            theme.palette.mode === "dark"
                              ? "0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px #62544B"
                              : "0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px #ECCFBD",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderWidth: "0px",
                        },
                      }}
                      multiline
                      fullWidth
                    />
                  ) : (
                    <Typography sx={{ fontSize: "18px", width: "100%", fontWeight: "bold" }}>
                      {editableNotebook.title}
                    </Typography>
                  )}
                  <Box
                    onClick={onOpenUserInfo}
                    sx={{
                      ml: "20px",
                      minWidth: "36px",
                      width: "36px",
                      height: "36px",
                      position: "relative",
                      borderRadius: "30px",
                      cursor: "pointer",
                      // border: "solid 2px",
                    }}
                  >
                    <NextImage
                      src={editableNotebook.ownerImgUrl ?? NO_USER_IMAGE}
                      alt={"owner image"}
                      width="36px"
                      height="36px"
                      quality={40}
                      objectFit="cover"
                      style={{ borderRadius: "30px" }}
                    />
                  </Box>
                </Stack>
                <Divider />
                <List sx={{ p: "0px", "& .MuiTypography-body1": { fontSize: "12px" } }}>
                  {/* TODO: remove type undefined on validation, Ameer will update with default */}
                  {(!editableNotebook.type || editableNotebook.type === "default") && (
                    <ListItem disablePadding>
                      <ListItemButton onClick={onRenameNotebook} sx={{ p: "12px 14px" }}>
                        <ListItemText primary="Rename" />
                      </ListItemButton>
                    </ListItem>
                  )}
                  <ListItem disablePadding>
                    <ListItemButton onClick={onDuplicateNotebook} sx={{ p: "12px 14px" }}>
                      <ListItemText primary="Duplicate" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton onClick={onCopyNotebookUrl} sx={{ p: "12px 14px" }}>
                      <ListItemText primary="Copy link to page" />
                    </ListItemButton>
                  </ListItem>
                  {editableNotebook.owner === user.uname &&
                    editableNotebook.type !== "course" &&
                    notebooks.length > 1 && (
                      <ListItem disablePadding>
                        <ListItemButton onClick={onDeleteNotebook} sx={{ p: "12px 14px" }}>
                          <ListItemText primary="Delete" />
                        </ListItemButton>
                      </ListItem>
                    )}
                </List>
              </Box>
            </ClickAwayListener>
          )}
        </Portal>

        {displayTagSearcher && (
          <Suspense fallback={<div>loading...</div>}>
            <ClickAwayListener onClickAway={onCloseTagSearcher}>
              <Modal
                open={displayTagSearcher}
                disablePortal
                hideBackdrop
                sx={{
                  "&.MuiModal-root": {
                    top: "100px",
                    left: "240px",
                    right: "unset",
                    bottom: "unset",
                  },
                }}
              >
                <MemoizedTagsSearcher
                  id="user-settings-tag-searcher"
                  setChosenTags={setChosenTags}
                  chosenTags={chosenTags}
                  allTags={allTags}
                  setAllTags={setAllTags}
                  width={"440px"}
                  height={"440px"}
                  onClose={onCloseTagSearcher}
                />
              </Modal>
            </ClickAwayListener>
          </Suspense>
        )}

        {/* --------------- */}

        {!displayLargeToolbar && (
          <Box
            sx={{
              display: window.innerWidth <= 500 ? "none" : "block",
              width: "50%",
              margin: "auto",
              marginTop: "14px",
              marginBottom: "14px",
              borderTop: theme => (theme.palette.mode === "dark" ? "solid 1px #303134" : "solid 1px #EAECF0"),
            }}
          />
        )}

        {/* --------------- */}

        <Stack
          id="toolbar-leaderboard"
          spacing={"10px"}
          direction="column"
          alignItems={displayLargeToolbar ? "flex-start" : "center"}
          sx={{
            paddingBottom: "20px",
            position: "relative",
            height: "100%",
            width: "inherit",
          }}
        >
          {displayLargeToolbar && (
            <Box sx={{ px: "10px", mt: "8px", width: "100%" }}>
              <Button
                sx={{
                  height: "36px",
                  display: "flex",
                  justifyContent: "space-between",
                  borderRadius: "16px",
                  px: "14px",
                  ":hover": {
                    background: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
                  },
                }}
                onClick={openLeaderboardTypes}
                fullWidth
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
                  {leaderBoardType ? LEADERBOARD_OPTIONS[leaderBoardType] : "Leaderboard"}
                </Box>
                <KeyboardArrowDownIcon
                  sx={{
                    transition: ".3s",
                    rotate: leaderboardTypeOpen ? "180deg" : "0deg",
                    color: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray800,
                  }}
                />
              </Button>
              {leaderboardTypeOpen && (
                <MultipleChoiceBtn
                  sx={{
                    zIndex: 999,
                    width: "86%",
                    marginX: "auto",
                    left: "7%",
                    top: "48px",
                    height: "173px",
                  }}
                  choices={choices}
                  onClose={openLeaderboardTypes}
                  comLeaderboardType={leaderBoardType ? LEADERBOARD_OPTIONS[leaderBoardType] : "Leaderboard"}
                />
              )}
            </Box>
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
    toolbarRef,
    displayLargeToolbar,
    user,
    reputation?.totalPoints,
    reputation?.positives,
    reputation?.negatives,
    onOpenUserSettingsSidebar,
    uncheckedNotificationsNum,
    bookmarkUpdatesNum,
    pendingProposalsNum,
    onDisplayInstructorPage,
    displayNotebooks,
    displayConversation,
    notebooks,
    isCreatingNotebook,
    onCreateNotebook,
    editableNotebook,
    onUpdateNotebookTitle,
    height,
    notebookTitleIsEditable,
    onOpenUserInfo,
    onDuplicateNotebook,
    onCopyNotebookUrl,
    onDeleteNotebook,
    displayTagSearcher,
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
    toolbarRef,
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
    disabledInstructorButton,
    disabledLeaderboardButton,
    userTutorial.searcher.done,
    userTutorial.searcher.skipped,
    leaderboardTypeOpen,
    leaderBoardType,
    displayTagSearcher,
    setChosenTags,
    chosenTags,
    displayNotebooks,
    displayConversation,
    displayLargeToolbar,
    notebooks,
    selectedNotebook,
    isCreatingNotebook,
    editableNotebook,
    onOpenUserInfo,
    notebookTitleIsEditable,
    isHovered,
    // titleInputRef.current,
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
        open={open || displayTagSearcher}
        onClose={onClose}
        width={80}
        showCloseButton={false}
        showScrollUpButton={false}
        contentSignalState={contentSignalState}
        SidebarContent={toolbarContentMemoized}
        sx={{
          boxShadow: undefined,
          width: { sm: displayLargeToolbar ? "240px" : "80px" },
          ...(isMenuOpen && { width: "100%" }),
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
      {ConfirmDialog}
    </>
  );
};

export const MemoizedToolbarSidebar = React.memo(ToolbarSidebar);
