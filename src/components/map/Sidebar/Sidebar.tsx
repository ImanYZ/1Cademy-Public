// import "./Sidebar.css";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button } from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import bookmarksDarkTheme from "../../../../public/bookmarks-dark-mode.jpg";
import bookmarksLightTheme from "../../../../public/bookmarks-light-theme.jpg";
// import ChatRoomImage from "../../../assets/ChatRoom.jpg";
// import RecentNodesImage from "../../../assets/RecentNodes.jpg";
// import RecentNodesLightModeImage from "../../../assets/lightmode_sort.jpg";
// import Citations from "../../../assets/Citations.jpg";
// import PresentationsImage from "../../../assets/darkmode_presentations.jpg";
import LogoDarkMode from "../../../../public/LogoDarkMode.svg";
// import BookmarksLightMode from "../../../assets/lightmode_bookmarks.jpg";
// import NotificationsLightModeImage from "../../../assets/lightmode_notif.jpg";
// import RefLightModeImage from "../../../assets/lightmode_pending.jpg";
// import PresentationsLightModeImage from "../../../assets/lightmode_presentations.jpg";
import LogoLightMode from "../../../../public/LogoLightMode.svg";
import searcherHeaderImage from "../../../../public/Magnifier_Compas.jpg";
import notificationsDarkTheme from "../../../../public/notifications-dark-theme.jpg";
import notificationsLightTheme from "../../../../public/notifications-light-theme.jpg";
import referencesDarkTheme from "../../../../public/references-dark-theme.jpg";
import referencesLightTheme from "../../../../public/references-light-theme.jpg";
import { useAuth } from "../../../context/AuthContext";
import { getTypedCollections } from "../../../lib/utils/getTypedCollections";
import { FullNodeData, UsersStatus } from "../../../nodeBookTypes";
import { NodeType } from "../../../types";
// import { FullNodeData, UsersStatus } from "../../../noteBookTypes";
import { MemoizedMetaButton } from "../MetaButton";
// import LoadingImg from "../../../assets/AnimatediconLoop.gif";
import Proposals from "../Proposals";
import { MemoizedUserStatusIcon } from "../UserStatusIcon";
import Bookmarks from "./Bookmarks";
import BookmarksButton from "./BookmarksButton";
import MultipleChoiceBtn from "./MultipleChoiceBtn";
import Notifications from "./Notifications";
import { NotificationsButton } from "./NotificationsButton";
import PendingProposalList from "./PendingProposalList";
import PendingProposalsButton from "./PendingProposalsButton";
import SearchList from "./SearchList";
// import SearchImage from "../../../assets/Magnifier_Compas.jpg";
// import NewsWriters from "../../../assets/NewsWriters.jpg";
// import NotificationsImage from "../../../assets/Notifications.jpg";
// import RefImage from "../../../assets/References.jpg";
import { MemoizedSidebarWrapper } from "./SidebarWrapper";
import UserInfo from "./UserInfo";
import UserSettings from "./UserSettings";
import UsersStatusList from "./UsersStatusList";
// import { useRecoilState, useRecoilValue } from "recoil";
// import Button from "@material-ui/core/Button";
// import SearchIcon from "@material-ui/icons/Search";
// import {
//   firebaseState,
//   isOnlineState,
//   usernameState,
//   imageUrlState,
//   fNameState,
//   lNameState,
//   chooseUnameState,
//   tagState,
//   themeState,
// } from "../../../store/AuthAtoms";
// import {
//   totalPointsState,
//   positivesState,
//   negativesState,
//   cnCorrectsState,
//   cnWrongsState,
//   cnInstState,
//   cdCorrectsState,
//   cdWrongsState,
//   cdInstState,
//   qCorrectsState,
//   qWrongsState,
//   qInstState,
//   pCorrectsState,
//   pWrongsState,
//   pInstState,
//   sCorrectsState,
//   sWrongsState,
//   sInstState,
//   aCorrectsState,
//   aWrongsState,
//   aInstState,
//   rfCorrectsState,
//   rfWrongsState,
//   rfInstState,
//   nCorrectsState,
//   nWrongsState,
//   nInstState,
//   mCorrectsState,
//   mWrongsState,
//   mInstState,
//   iCorrectsState,
//   iWrongsState,
//   iInstState,
//   ltermState,
// } from "../../../store/UserReputationAtoms";
// import {
//   selectionTypeState,
//   openPendingProposalsState,
//   openChatState,
//   openNotificationsState,
//   openPresentationsState,
//   openToolbarState,
//   openSearchState,
//   openBookmarksState,
//   openRecentNodesState,
//   openTrendsState,
//   openMediaState,
//   selectedUserState,
// } from "../../../store/MapAtoms";
// import SidebarWrapper from "./SidebarWrapper/SidebarWrapper";
// import UsersStatusList from "./UsersStatus/UsersStatusList/UsersStatusList";
// import UserStatusIcon from "./UsersStatus/UserStatusIcon/UserStatusIcon";

// const Proposals = React.lazy(() => import("./Proposals/Proposals/Proposals"));
// const PendingProposalList = React.lazy(() => import("./PendingProposals/PendingProposalList/PendingProposalList"));
// const ChatList = React.lazy(() => import("./ChatRoom/ChatList/ChatList"));
// const Notifications = React.lazy(() => import("./Notifications/Notifications/Notifications"));
// const Presentations = React.lazy(() =>import("./Presentations/PresentationsList/PresentationsList"));
// const UserSettings = React.lazy(() => import("./UserSettings/UserSettings"));
// const SearchList = React.lazy(() => import("./Search/SearchList/SearchList"));
// const Bookmarks = React.lazy(() => import("./Bookmarks/Bookmarks/Bookmarks"));
// const RecentNodesList = React.lazy(() => import("./RecentNodes/RecentNodesList/RecentNodesList"));
// const CitationsList = React.lazy(() => import("./Citations/Citations"));
// const UserInfo = React.lazy(() => import("./UsersStatus/UserInfo/UserInfo"));

const lBTypes = ["Weekly", "Monthly", "All Time", "Others' Votes", "Others Monthly"];
const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

type SidebarType = {
  // reputationsLoaded: any;
  // reputationsWeeklyLoaded: any;
  // reputationsMonthlyLoaded: any;
  openLinkedNode: any;
  proposeNodeImprovement: any; //
  fetchProposals: any; //
  rateProposal: any; //
  selectProposal: any; //
  deleteProposal: any; //
  closeSideBar: any; //
  proposeNewChild: any; //
  // reloadPermanentGrpah: any;
  // openPractice: any;
  // setOpenPractice: any;
  // --------------------------- flags
  setOpenPendingProposals: any;
  openPendingProposals: boolean;
  setOpenChat: any;
  setOpenNotifications: any;
  openNotifications: boolean;
  setOpenPresentations: any;
  setOpenToolbar: any;
  openToolbar: boolean;
  setOpenSearch: any;
  openSearch: boolean;
  setOpenBookmarks: any;
  openBookmarks: boolean;
  setOpenRecentNodes: any;
  setOpenTrends: any;
  openTrends: any;
  setOpenMedia: any;
  // --------------------------- Others
  selectionType: any;
  setSNode: any;
  selectedUser: any;
  allNodes: FullNodeData[];
  reloadPermanentGrpah: any;
  showClusters: boolean;
  setShowClusters: (newValue: boolean) => void;
  mapRendered: boolean;
  pendingProposalsLoaded: boolean;
  setPendingProposalsLoaded: (newValue: boolean) => void;
  openProposal: string;
};

const Sidebar = (props: SidebarType) => {
  // const firebase = useRecoilValue(firebaseState);
  // const isOnline = useRecoilValue(isOnlineState);
  // const username = useRecoilValue(usernameState);
  // const imageUrl = useRecoilValue(imageUrlState);
  // const fName = useRecoilValue(fNameState);
  // const lName = useRecoilValue(lNameState);
  // const chooseUname = useRecoilValue(chooseUnameState);
  // const tag = useRecoilValue(tagState);

  // const totalPoints = useRecoilValue(totalPointsState);
  // const Positivess = useRecoilValue(positivesState);
  // const Negatives = useRecoilValue(negativesState);
  // // for Concept nodes
  // const cnCorrects = useRecoilValue(cnCorrectsState);
  // const cnWrongs = useRecoilValue(cnWrongsState);
  // const cnInst = useRecoilValue(cnInstState);
  // // for Code nodes
  // const cdCorrects = useRecoilValue(cdCorrectsState);
  // const cdWrongs = useRecoilValue(cdWrongsState);
  // const cdInst = useRecoilValue(cdInstState);
  // // for Question nodes
  // const qCorrects = useRecoilValue(qCorrectsState);
  // const qWrongs = useRecoilValue(qWrongsState);
  // const qInst = useRecoilValue(qInstState);
  // //  for Profile nodes
  // const pCorrects = useRecoilValue(pCorrectsState);
  // const pWrongs = useRecoilValue(pWrongsState);
  // const pInst = useRecoilValue(pInstState);
  // //  for Sequel nodes
  // const sCorrects = useRecoilValue(sCorrectsState);
  // const sWrongs = useRecoilValue(sWrongsState);
  // const sInst = useRecoilValue(sInstState);
  // //  for Advertisement nodes
  // const aCorrects = useRecoilValue(aCorrectsState);
  // const aWrongs = useRecoilValue(aWrongsState);
  // const aInst = useRecoilValue(aInstState);
  // //  for Reference nodes
  // const rfCorrects = useRecoilValue(rfCorrectsState);
  // const rfWrongs = useRecoilValue(rfWrongsState);
  // const rfInst = useRecoilValue(rfInstState);
  // //  for News nodes
  // const nCorrects = useRecoilValue(nCorrectsState);
  // const nWrongs = useRecoilValue(nWrongsState);
  // const nInst = useRecoilValue(nInstState);
  // //  for Relation Nodes
  // const mCorrects = useRecoilValue(mCorrectsState);
  // const mWrongs = useRecoilValue(mWrongsState);
  // const mInst = useRecoilValue(mInstState);
  // //  for Idea nodes
  // const iCorrects = useRecoilValue(iCorrectsState);
  // const iWrongs = useRecoilValue(iWrongsState);
  // const iInst = useRecoilValue(iInstState);

  // const lterm = useRecoilValue(ltermState);
  // const selectionType = useRecoilValue(selectionTypeState);
  // const [openPendingProposals, setOpenPendingProposals] = useRecoilState(openPendingProposalsState);
  // const [openChat, setOpenChat] = useRecoilState(openChatState);
  // const [openNotifications, setOpenNotifications] = useRecoilState(openNotificationsState);
  // const [openPresentations, setOpenPresentations] = useRecoilState(openPresentationsState);
  // const [openToolbar, setOpenToolbar] = useRecoilState(openToolbarState);
  // const [openSearch, setOpenSearch] = useRecoilState(openSearchState);
  // const [openBookmarks, setOpenBookmarks] = useRecoilState(openBookmarksState);
  // const [openRecentNodes, setOpenRecentNodes] = useRecoilState(openRecentNodesState);
  // const [openTrends, setOpenTrends] = useRecoilState(openTrendsState);
  // const [openMedia, setOpenMedia] = useRecoilState(openMediaState);
  // const selectedUser = useRecoilValue(selectedUserState);
  // const theme = useRecoilValue(themeState);

  const [{ user, reputation, settings }] = useAuth();
  const db = getFirestore();

  // const [selectionType] = useState("Proposals");
  const [openPresentations] = useState(false);
  // const [openPendingProposals] = useState(false);
  const [openChat] = useState(false);
  // const [openNotifications] = useState(false);
  // const [openToolbar] = useState(false);
  // const [tag] = useState(false);

  // const [bookmarkedUserNodes, setBookmarkedUserNodes] = useState<any[]>([]);
  // const [openSearch] = useState(false);
  // const [openBookmarks] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState<UsersStatus>("Weekly");
  const [leaderboardTypeOpen, setLeaderboardTypeOpen] = useState(false);
  const [uncheckedNotificationsNum, setUncheckedNotificationsNum] = useState(0);
  const [pendingProposalsNum, setPendingProposalsNum] = useState(0);
  // const [pendingProposalsLoaded, setPendingProposalsLoaded] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);

  const sidebarRef = useRef<any | null>(null);

  // const scrollToTop = useCallback(() => {
  //   console.log(sidebarRef.current);
  //   if (!sidebarRef.current) return;
  //   sidebarRef.current.scrollTop = 0;
  // }, [sidebarRef]);

  useEffect(() => {
    if (!props.mapRendered) return;
    if (!user) return;

    const notificationNumbersQuery = doc(db, "notificationNums", user.uname);

    const killSnapshot = onSnapshot(notificationNumbersQuery, async snapshot => {
      if (!snapshot.exists()) return;

      setUncheckedNotificationsNum(snapshot.data().nNum);
      // setNotificationNumsLoaded(true);
    });
    // const notificationsQuery = db.collection("notificationNums").doc(user.uname);
    // notificationNumbersQuery.notificationsSnapshot = notificationsQuery.onSnapshot(function (docSnapshot) {
    //   if (docSnapshot.exists) {
    //     // setUncheckedNotificationsNum(docSnapshot.data().nNum);
    //     // setNotificationNumsLoaded(true);
    //   }
    // });
    // }, 1300);
    return () => killSnapshot();
  }, [db, props.mapRendered, user]);

  useEffect(() => {
    if (!user) return;

    // if (firebase) {
    const versionsSnapshots: any[] = [];
    const versions: { [key: string]: any } = {};
    for (let nodeType of NODE_TYPES_ARRAY) {
      const { versionsColl, userVersionsColl } = getTypedCollections(db, nodeType);
      if (!versionsColl || !userVersionsColl) continue;

      const versionsQuery = query(
        versionsColl,
        where("accepted", "==", false),
        where("tagIds", "array-contains", user.tagId),
        where("deleted", "==", false)
      );

      const versionsSnapshot = onSnapshot(versionsQuery, async snapshot => {
        const docChanges = snapshot.docChanges();
        if (docChanges.length > 0) {
          // const temporalProposals:any[] = []
          for (let change of docChanges) {
            const versionId = change.doc.id;
            const versionData = change.doc.data();
            if (change.type === "removed") {
              delete versions[versionId];
            }
            if (change.type === "added" || change.type === "modified") {
              versions[versionId] = {
                ...versionData,
                id: versionId,
                createdAt: versionData.createdAt.toDate(),
                award: false,
                correct: false,
                wrong: false,
              };
              delete versions[versionId].deleted;
              delete versions[versionId].updatedAt;

              const q = query(
                userVersionsColl,
                where("version", "==", versionId),
                where("user", "==", user.uname),
                limit(1)
              );

              const userVersionsDocs = await getDocs(q);

              // const userVersionsDocs = await userVersionsColl
              //   .where("version", "==", versionId)
              //   .where("user", "==", user.uname)
              //   .limit(1)
              //   .get();

              for (let userVersionsDoc of userVersionsDocs.docs) {
                const userVersion = userVersionsDoc.data();
                delete userVersion.version;
                delete userVersion.updatedAt;
                delete userVersion.createdAt;
                delete userVersion.user;
                versions[versionId] = {
                  ...versions[versionId],
                  ...userVersion,
                };
              }
            }
          }
          let unevaluatedPendingProposalsNum = 0;
          for (let pendingP of Object.values(versions)) {
            if (!pendingP.correct && !pendingP.wrong) {
              unevaluatedPendingProposalsNum++;
            }
          }
          setPendingProposalsNum(unevaluatedPendingProposalsNum);

          const pendingProposals = { ...versions };
          const proposalsTemp = Object.values(pendingProposals);
          const orderredProposals = proposalsTemp.sort(
            (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
          );
          setProposals(orderredProposals);
          // setProposals(orderredProposals.slice(0, lastIndex));
          // setPendingProposals({ ...versions });
          // temporalProposals.push(temporalProposals)
        }
        props.setPendingProposalsLoaded(true);
      });
      versionsSnapshots.push(versionsSnapshot);
    }
    ``;
    return () => {
      for (let vSnapshot of versionsSnapshots) {
        vSnapshot();
      }
    };
    // }
  }, [db, user]);

  const openSideBar = useCallback(
    async (sidebarType: string) => {
      // console.log("------------------>> sidebarType", sidebarType, user);
      console.log("Open sidebar");
      if (!user) return;
      // console.log("has user");
      // console.log("In openSideBar");
      if (sidebarType === "PendingProposals") {
        props.setOpenPendingProposals(true);
      } else if (sidebarType === "UserInfo") {
        props.setOpenChat(true);
      } else if (sidebarType === "Notifications") {
        props.setOpenNotifications(true);
      } else if (sidebarType === "Presentations") {
        props.setOpenPresentations(true);
      } else if (sidebarType === "Chat") {
        props.setOpenChat(true);
      } else if (sidebarType === "UserSettings") {
        props.setOpenToolbar(true);
      } else if (sidebarType === "Search") {
        props.setOpenSearch(true);
      } else if (sidebarType === "Bookmarks") {
        props.setOpenBookmarks(true);
      } else if (sidebarType === "RecentNodes") {
        props.setOpenRecentNodes(true);
      } else if (sidebarType === "Trends") {
        props.setOpenTrends(true);
      } else if (sidebarType === "Media") {
        props.setOpenMedia(true);
      }

      // const userOpenSidebarLogRef = db.collection("userOpenSidebarLog").doc();
      const userOpenSidebarLogObj: any = {
        uname: user.uname,
        sidebarType,
        createdAt: Timestamp.fromDate(new Date()),
      };
      if (props.selectedUser) {
        userOpenSidebarLogObj.selectedUser = props.selectedUser;
      }
      const userOpenSidebarLogRef = doc(collection(db, "userOpenSidebarLog"));
      await setDoc(userOpenSidebarLogRef, userOpenSidebarLogObj);

      // await setDoc(doc(db, "userOpenSidebarLog"), userOpenSidebarLogObj);
      // userOpenSidebarLogRef.set(userOpenSidebarLogObj);
    },
    [user, props, db]
  );

  const openSideBarClick = useCallback(
    (sidebarType: string) => (event: any) => {
      console.log("click openSideBarClick", sidebarType);
      openSideBar(sidebarType);
      event.currentTarget.blur();
      event.stopPropagation();
    },
    [openSideBar]
  );

  // const setUsersStatusClick = useCallback(
  //   (event) => {
  //     const usersStatusStates = ["Weekly", "Monthly", "All Time", false];
  //     setUsersStatus((oldUsersStatus) => {
  //       let oldStatusIdx = usersStatusStates.findIndex((uStatus) => uStatus === oldUsersStatus);
  //       if (oldStatusIdx === usersStatusStates.length - 1) {
  //         oldStatusIdx = 0;
  //       } else {
  //         oldStatusIdx++;
  //       }
  //       const userLeaderboardLogRef = firebase.db.collection("userLeaderboardLog").doc();
  //       userLeaderboardLogRef.set({
  //         uname: username,
  //         type: usersStatusStates[oldStatusIdx],
  //         createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
  //       });
  //       return usersStatusStates[oldStatusIdx];
  //     });
  //   },
  //   [firebase, username]
  // );

  const leaderboardTypesToggle = useCallback(() => {
    setLeaderboardTypeOpen(oldCLT => !oldCLT);
  }, []);

  const changeLeaderboard = useCallback(
    async (lBType: any, username: string) => {
      console.log("==>> changeLeaderboard", lBType, username);
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

  // const boxShadowCSS = boxShadowCSSGenerator(selectionType);

  // let theme = "Dark";

  const isHide =
    props.selectionType ||
    props.openPendingProposals ||
    openChat ||
    props.openNotifications ||
    openPresentations ||
    props.openToolbar ||
    props.openSearch ||
    props.openTrends ||
    props.openBookmarks; /* ||  //CHECK: I commented this
  openRecentNodes ||
  openMedia*/

  const bookmarkUpdatesNum = useMemo(() => {
    return props.allNodes.filter(cur => cur.changed || !cur.isStudied).length;
  }, [props.allNodes]);

  if (!user || !reputation) return null;

  return (
    <>
      {/* {openToolbar && tag && (
          <Toolbar openPractice={props.openPractice} setOpenPractice={props.setOpenPractice} />reputation
      )} */}

      {/* sidebar menu here ----------------------------- */}

      <div
        id="SidebarButtonsContainer"
        style={{
          display: isHide ? "none" : undefined,
          // border: "solid 2px royalBlue",
        }}
      >
        <div id="SidebarButtons">
          <div className="Logo">
            <MemoizedMetaButton
            // onClick={openSideBarClick("Trends")} // CHECK: I commented this, the sidebar trends was commented
            // tooltip="Click to open the trends in proposals."
            // tooltipPosition="Right"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Box sx={{ display: "grid", placeItems: "center" }}>
                <img src={settings.theme === "Light" ? LogoLightMode.src : LogoDarkMode.src} alt="1Logo" width="61px" />
              </Box>
            </MemoizedMetaButton>
          </div>
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
            reloadPermanentGrpah={props.reloadPermanentGrpah}
            sx={{ justifyContent: "center" }}
          />

          <Button id="SearchButton" onClick={openSideBarClick("Search")}>
            <SearchIcon />
            <span className="SidebarDescription">Search</span>
          </Button>

          <NotificationsButton openSideBar={openSideBar} uncheckedNotificationsNum={uncheckedNotificationsNum} />
          <BookmarksButton openSideBar={openSideBar} bookmarkUpdatesNum={bookmarkUpdatesNum} />
          <PendingProposalsButton
            openSideBar={openSideBar}
            pendingProposalsNum={pendingProposalsNum}
            pendingProposalsLoaded={props.pendingProposalsLoaded}
          />

          {/* <PresentationsButton openSideBar={openSideBar} />
          <MemoizedMetaButton
            onClick={openSideBarClick("Chat")}
            // tooltip="Click to open the chat room."
            // tooltipPosition="Right"
          >
            <i className="material-icons material-icons--outlined">forum</i>
            <span className="SidebarDescription">Chat</span>
          </MemoizedMetaButton> */}
          {user?.tag && (
            <>
              <MemoizedMetaButton
                onClick={leaderboardTypesToggle}
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

                  <div id="LeaderboardChanger" className="SidebarDescription">
                    <div id="LeaderboardTag" style={{ textOverflow: "ellipsis", width: "90px" }}>
                      {user.tag}
                    </div>
                    <div id="LeaderboardType" style={{ fontSize: "12px" }}>
                      {leaderboardType ? leaderboardType : "Leaderboard"}
                    </div>
                  </div>
                </Box>
              </MemoizedMetaButton>
              {leaderboardTypeOpen && <MultipleChoiceBtn choices={choices} close={leaderboardTypesToggle} />}
              {leaderboardType && (
                <UsersStatusList
                  // reputationsLoaded={props.reputationsLoaded}
                  // reputationsWeeklyLoaded={props.reputationsWeeklyLoaded}
                  // reputationsMonthlyLoaded={props.reputationsMonthlyLoaded}
                  // reloadPermanentGrpah={props.reloadPermanentGrpah}
                  usersStatus={leaderboardType}
                  reloadPermanentGraph={props.reloadPermanentGrpah}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Every sidebar is here ------------------------- */}
      <div
        id="Sidebar"
        ref={sidebarRef}
        className={
          props.selectionType === "Proposals" ||
          props.selectionType === "AcceptedProposals" ||
          props.selectionType === "Comments" ||
          props.selectionType === "Citations" ||
          props.selectionType === "UserInfo" ||
          props.openSearch ||
          props.openNotifications ||
          props.openPendingProposals ||
          props.openToolbar ||
          props.openBookmarks
            ? // openChat ||
              // openPresentations ||
              // openRecentNodes
              "active"
            : ""
        }
      >
        {/* side bar options */}
        <Suspense fallback={<div>loading...</div>}>
          {openPresentations ? (
            <MemoizedSidebarWrapper
              headerImage={settings.theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Presentations"
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              {/* CHECK: I commented this */}
              {/* <Presentations openLinkedNode={props.openLinkedNode} /> */}
              <h1>openPresentations</h1>
            </MemoizedSidebarWrapper>
          ) : props.openSearch ? (
            <MemoizedSidebarWrapper
              headerImage={searcherHeaderImage}
              title="Search Nodes"
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <SearchList openLinkedNode={props.openLinkedNode} /* triggerQuerySearch={props.triggerQuerySearch}*/ />
            </MemoizedSidebarWrapper>
          ) : props.selectionType === "Proposals" ? (
            <MemoizedSidebarWrapper
              headerImage={settings.theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Proposals"
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <Proposals
                proposeNodeImprovement={props.proposeNodeImprovement}
                fetchProposals={props.fetchProposals}
                rateProposal={props.rateProposal}
                selectProposal={props.selectProposal}
                deleteProposal={props.deleteProposal}
                // editHistory={false}
                proposeNewChild={props.proposeNewChild}
                openProposal={props.openProposal}
              />
            </MemoizedSidebarWrapper>
          ) : props.selectionType === "Comments" ? (
            <h3>Comments</h3>
          ) : props.openPendingProposals ? (
            <MemoizedSidebarWrapper
              headerImage={settings.theme === "Dark" ? referencesDarkTheme : referencesLightTheme}
              title="Pending Proposals"
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
              // noHeader
            >
              <PendingProposalList proposals={proposals} openLinkedNode={props.openLinkedNode} />
            </MemoizedSidebarWrapper>
          ) : openChat ? (
            <MemoizedSidebarWrapper
              headerImage="" // CHECK: image{ChatRoomImage}
              title="Chat Room!"
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              {/* CHECK: I commented this */}
              {/* <ChatList openLinkedNode={props.openLinkedNode} /> */}
              <h2>openChat</h2>
            </MemoizedSidebarWrapper>
          ) : props.openNotifications ? (
            <MemoizedSidebarWrapper
              headerImage={settings.theme === "Dark" ? notificationsDarkTheme : notificationsLightTheme}
              title="Notifications"
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <Notifications openLinkedNode={props.openLinkedNode} />
            </MemoizedSidebarWrapper>
          ) : props.openToolbar && user?.tag ? (
            <MemoizedSidebarWrapper
              headerImage=""
              title=""
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
              noHeader={true}
            >
              <UserSettings
                user={user}
                userReputation={
                  reputation
                } /*openPractice={props.openPractice} setOpenPractice={props.setOpenPractice} */
                showClusters={props.showClusters}
                setShowClusters={props.setShowClusters}
              />
            </MemoizedSidebarWrapper>
          ) : props.openBookmarks ? (
            <MemoizedSidebarWrapper
              headerImage={settings.theme === "Dark" ? bookmarksDarkTheme : bookmarksLightTheme}
              title="Bookmarks"
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <Bookmarks bookmarkedUserNodes={props.allNodes} openLinkedNode={props.openLinkedNode} />
            </MemoizedSidebarWrapper>
          ) : props.selectionType === "Citations" ? (
            <MemoizedSidebarWrapper
              headerImage="" // CHECK image
              title="Citing Nodes"
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              {/* CHECK: I commented this */}
              {/* <CitationsList openLinkedNode={props.openLinkedNode} /> */}
              <h2>CitationsList here</h2>
            </MemoizedSidebarWrapper>
          ) : props.selectionType === "UserInfo" ? (
            <MemoizedSidebarWrapper
              headerImage=""
              title=""
              // scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
              noHeader={true}
            >
              <UserInfo openLinkedNode={props.openLinkedNode} />
            </MemoizedSidebarWrapper>
          ) : (
            <span />
          )}
        </Suspense>
      </div>
    </>
  );
};

export const MemoizedSidebar = React.memo(Sidebar);
