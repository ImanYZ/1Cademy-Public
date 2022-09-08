// import "./Sidebar.css";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";
import {
  collection,
  doc,
  DocumentData,
  getFirestore,
  onSnapshot,
  Query,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";

import bookmarksDarkTheme from "../../../../public/bookmarks-dark-mode.jpg";
import bookmarksLightTheme from "../../../../public/bookmarks-light-theme.jpg";
import searcherHeaderImage from "../../../../public/Magnifier_Compas.jpg";
import referencesDarkTheme from "../../../../public/references-dark-theme.jpg";
import referencesLightTheme from "../../../../public/references-dark-theme.jpg";
import { useAuth } from "../../../context/AuthContext";
import { UserNodesData } from "../../../nodeBookTypes";
// import LoadingImg from "../../../assets/AnimatediconLoop.gif";
import Proposals from "../Proposals";
import Bookmarks from "./Bookmarks";
import BookmarksButton from "./BookmarksButton";
import SearchList from "./SearchList";
// import ChatRoomImage from "../../../assets/ChatRoom.jpg";
// import RecentNodesImage from "../../../assets/RecentNodes.jpg";
// import RecentNodesLightModeImage from "../../../assets/lightmode_sort.jpg";
// import Citations from "../../../assets/Citations.jpg";
// import PresentationsImage from "../../../assets/darkmode_presentations.jpg";
// import LogoDarkMode from "../../../assets/DarkModeLogo.svg";
// import BookmarksLightMode from "../../../assets/lightmode_bookmarks.jpg";
// import NotificationsLightModeImage from "../../../assets/lightmode_notif.jpg";
// import RefLightModeImage from "../../../assets/lightmode_pending.jpg";
// import PresentationsLightModeImage from "../../../assets/lightmode_presentations.jpg";
// import LogoLightMode from "../../../assets/LightModeLogo.svg";
// import SearchImage from "../../../assets/Magnifier_Compas.jpg";
// import NewsWriters from "../../../assets/NewsWriters.jpg";
// import NotificationsImage from "../../../assets/Notifications.jpg";
// import RefImage from "../../../assets/References.jpg";
import { MemoizedSidebarWrapper } from "./SidebarWrapper";
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

// const lBTypes = ["Weekly", "Monthly", "All Time", "Others' Votes", "Others Monthly"];

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
  setOpenChat: any;
  setOpenNotifications: any;
  setOpenPresentations: any;
  setOpenToolbar: any;
  setOpenSearch: any;
  openSearch: boolean;
  setOpenBookmarks: any;
  openBookmarks: boolean;
  setOpenRecentNodes: any;
  setOpenTrends: any;
  setOpenMedia: any;
  // --------------------------- Others
  selectionType: any;
  setSNode: any;
  selectedUser: any;
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

  const [{ user }] = useAuth();
  const db = getFirestore();

  // const [selectionType] = useState("Proposals");
  const [openPresentations] = useState(false);
  const [openPendingProposals] = useState(false);
  const [openChat] = useState(false);
  const [openNotifications] = useState(false);
  const [openToolbar] = useState(false);
  const [tag] = useState(false);

  const [/*bookmarkedUserNodes,*/ setBookmarkedUserNodes] = useState<any[]>([]);
  // const [openSearch] = useState(false);
  // const [openBookmarks] = useState(false);
  // const [leaderboardType, setLeaderboardType] = useState("Weekly");
  // const [leaderboardTypeOpen, setLeaderboardTypeOpen] = useState(false);

  const sidebarRef = useRef<any | null>(null);

  const snapshot = useCallback((q: Query<DocumentData>) => {
    const userNodesSnapshot = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return null;

      const newBookmarkedUserNodes = docChanges.map(change => {
        const userNodeData: UserNodesData = change.doc.data() as UserNodesData;
        // return {
        //   cType: change.type,
        //   uNodeId: change.doc.id,
        //   uNodeData: userNodeData,
        // };
        return userNodeData;
      });
      console.log("newBookmarkedUserNodes", newBookmarkedUserNodes);
      setBookmarkedUserNodes(newBookmarkedUserNodes);
    });
    return () => userNodesSnapshot();
  }, []);

  useEffect(() => {
    if (!db) return;
    if (!user) return;

    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", user.uname),
      where("deleted", "==", false),
      where("bookmarked", "==", true)
    );

    const killSnapshot = snapshot(q);
    return () => {
      killSnapshot();
    };
  }, [db, snapshot, user]);

  const scrollToTop = useCallback(() => {
    sidebarRef.current.scrollTop = 0;
  }, [sidebarRef]);

  const openSideBar = useCallback(
    async (sidebarType: string) => {
      console.log("------------------>> sidebarType", sidebarType, user);
      if (!user) return;
      console.log("has user");
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
        console.log("is search");
        props.setOpenSearch(true);
      } else if (sidebarType === "Bookmarks") {
        console.log("is bookmarks");
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

  // const leaderboardTypesToggle = useCallback((event) => {
  //   setLeaderboardTypeOpen((oldCLT) => !oldCLT);
  // }, []);

  // const changeLeaderboard = useCallback(
  //   (lBType) => (event) => {
  //     setLeaderboardType(lBType);
  //     setLeaderboardTypeOpen(false);
  //     const userLeaderboardLogRef = firebase.db.collection("userLeaderboardLog").doc();
  //     userLeaderboardLogRef.set({
  //       uname: username,
  //       type: lBType,
  //       createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
  //     });
  //   },
  //   [firebase, username]
  // );

  // const choices = useMemo(
  //   () =>
  //     lBTypes.map((lBType) => {
  //       return { label: lBType, choose: changeLeaderboard(lBType) };
  //     }),
  //   [changeLeaderboard]
  // );

  // const boxShadowCSS = boxShadowCSSGenerator(selectionType);

  const theme = "Dark";

  const isHide =
    props.selectionType ||
    openPendingProposals ||
    openChat ||
    openNotifications ||
    openPresentations ||
    openToolbar ||
    props.openSearch ||
    props.openBookmarks; /* ||  //CHECK: I commented this
  openRecentNodes ||
  openTrends ||
  openMedia*/

  return (
    <>
      {/* {openToolbar && tag && (
          <Toolbar openPractice={props.openPractice} setOpenPractice={props.setOpenPractice} />
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
            {/* <MemoizedMetaButton
              onClick={openSideBarClick("Trends")}
              // tooltip="Click to open the trends in proposals."
              // tooltipPosition="Right"
            >
              <img src={theme === "Light" ? LogoLightMode : LogoDarkMode} alt="1Logo" width="61px" />
            </MemoizedMetaButton>
          </div>
          <UserStatusIcon
            uname={username}
            totalPoints={totalPoints}
            totalPositives={Positivess}
            totalNegatives={Negatives}
            imageUrl={imageUrl}
            fullname={fName + " " + lName}
            chooseUname={chooseUname}
            online={isOnline}
            inUserBar={true}
            inNodeFooter={false}
            reloadPermanentGrpah={props.reloadPermanentGrpah}
          /> */}
            {/* <Button id="SearchButton" onClick={openSideBarClick("Search")}>
            <SearchIcon />

            <span className="SidebarDescription">Search</span>
          </Button> */}
            <Button id="SearchButton" onClick={openSideBarClick("Search")}>
              <SearchIcon />
              <span className="SidebarDescription">Search</span>
            </Button>

            {/* <NotificationsButton openSideBar={openSideBar} /> */}
            <BookmarksButton openSideBar={openSideBar} />
            {/*<PendingProposalsButton openSideBar={openSideBar} />

          <PresentationsButton openSideBar={openSideBar} />
          <MemoizedMetaButton
            onClick={openSideBarClick("Chat")}
            // tooltip="Click to open the chat room."
            // tooltipPosition="Right"
          >
            <i className="material-icons material-icons--outlined">forum</i>
            <span className="SidebarDescription">Chat</span>
          </MemoizedMetaButton>
          {tag && (
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
                <div className="LeaderbaordIcon">🏆</div>
                {!props.reputationsLoaded && (
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
                )}

                <div id="LeaderboardChanger" className="SidebarDescription">
                  <div id="LeaderboardTag">{tag.title}</div>
                  <div id="LeaderboardType">{leaderboardType ? leaderboardType : "Leaderboard"}</div>
                </div>
              </MemoizedMetaButton>
              {leaderboardTypeOpen && <MultipleChoiceBtn choices={choices} close={leaderboardTypesToggle} />}
              {leaderboardType && (
                <UsersStatusList
                  reputationsLoaded={props.reputationsLoaded}
                  reputationsWeeklyLoaded={props.reputationsWeeklyLoaded}
                  reputationsMonthlyLoaded={props.reputationsMonthlyLoaded}
                  reloadPermanentGrpah={props.reloadPermanentGrpah}
                  usersStatus={leaderboardType}
                />
              )}
            </>
          )} */}
          </div>
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
          props.openBookmarks
            ? // openPendingProposals ||
              // openChat ||
              // openNotifications ||
              // openPresentations ||
              // openToolbar ||
              // openRecentNodes
              "active"
            : ""
        }
      >
        {/* side bar options */}
        <Suspense fallback={<div>loading...</div>}>
          {openPresentations ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Presentations"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              {/* CHECK: I commented this */}
              {/* <Presentations openLinkedNode={props.openLinkedNode} /> */}
              <h1>openPresentations</h1>
            </MemoizedSidebarWrapper>
          ) : props.selectionType === "Proposals" ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Proposals"
              scrollToTop={scrollToTop}
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
              />
            </MemoizedSidebarWrapper>
          ) : props.selectionType === "Comments" ? (
            <h3>Comments</h3>
          ) : openPendingProposals ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Pending Proposals"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <>
                <h4 style={{ textAlign: "center" }}>-- Pending Proposals Sidebar --</h4>
                {/* <PendingProposalList openLinkedNode={props.openLinkedNode} /> */}
              </>
            </MemoizedSidebarWrapper>
          ) : openChat ? (
            <MemoizedSidebarWrapper
              headerImage="" // CHECK: image{ChatRoomImage}
              title="Chat Room!"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              {/* CHECK: I commented this */}
              {/* <ChatList openLinkedNode={props.openLinkedNode} /> */}
              <h2>openChat</h2>
            </MemoizedSidebarWrapper>
          ) : openNotifications ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Notifications"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              {/* CHECK: I commented this */}
              {/* <Notifications openLinkedNode={props.openLinkedNode} /> */}
              <h2>openNotifications</h2>
            </MemoizedSidebarWrapper>
          ) : openToolbar && tag ? (
            <MemoizedSidebarWrapper
              headerImage=""
              title=""
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
              noHeader={true}
            >
              {/* CHECK: I commented this */}
              {/* <UserSettings
                openPractice={props.openPractice}
                setOpenPractice={props.setOpenPractice}
              /> */}
              <h2>User settings here</h2>
            </MemoizedSidebarWrapper>
          ) : props.openSearch ? (
            <MemoizedSidebarWrapper
              headerImage={searcherHeaderImage}
              title="Search Nodes"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <SearchList openLinkedNode={props.openLinkedNode} /* triggerQuerySearch={props.triggerQuerySearch}*/ />
            </MemoizedSidebarWrapper>
          ) : props.openBookmarks ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? bookmarksDarkTheme : bookmarksLightTheme}
              title="Bookmarks"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <Bookmarks openLinkedNode={props.openLinkedNode} />
            </MemoizedSidebarWrapper>
          ) : props.selectionType === "Citations" ? (
            <MemoizedSidebarWrapper
              headerImage="" // CHECK image
              title="Citing Nodes"
              scrollToTop={scrollToTop}
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
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
              noHeader={true}
            >
              {/* CHECK: I commented this */}
              {/* <UserInfo openLinkedNode={props.openLinkedNode} /> */}
              <h2>UserInfo here</h2>
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

// --------------- sidebar menu

{
  /* <div
        id="SidebarButtonsContainer"
        style={
          selectionType ||
            openPendingProposals ||
            openChat ||
            openNotifications ||
            openPresentations ||
            openToolbar ||
            openSearch ||
            openBookmarks ||
            openRecentNodes ||
            openTrends ||
            openMedia
            ? { display: "none" }
            : undefined
        }
      >
        <div id="SidebarButtons">
          <div className="Logo">
            <MemoizedMetaButton
              onClick={openSideBarClick("Trends")}
            // tooltip="Click to open the trends in proposals."
            // tooltipPosition="Right"
            >
              <img
                src={theme === "Light" ? LogoLightMode : LogoDarkMode}
                alt="1Logo"
                width="61px"
              />
            </MemoizedMetaButton>
          </div>
          <UserStatusIcon
            uname={username}
            totalPoints={totalPoints}
            totalPositives={Positivess}
            totalNegatives={Negatives}
            imageUrl={imageUrl}
            fullname={fName + " " + lName}
            chooseUname={chooseUname}
            online={isOnline}
            inUserBar={true}
            inNodeFooter={false}
            reloadPermanentGrpah={props.reloadPermanentGrpah}
          />
          <Button id="SearchButton" onClick={openSideBarClick("Search")}>
            <SearchIcon />
            
            <span className="SidebarDescription">Search</span>
            
          </Button>
          
          <NotificationsButton openSideBar={openSideBar} />
          <BookmarksButton openSideBar={openSideBar} />
          <PendingProposalsButton openSideBar={openSideBar} />
          
          <PresentationsButton openSideBar={openSideBar} />
          <MemoizedMetaButton
            onClick={openSideBarClick("Chat")}
          // tooltip="Click to open the chat room."
          // tooltipPosition="Right"
          >
            <i className="material-icons material-icons--outlined">forum</i>
            <span className="SidebarDescription">Chat</span>
          </MemoizedMetaButton>
          {tag && (
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
                <div className="LeaderbaordIcon">🏆</div>
                {!props.reputationsLoaded && (
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
                )}
                
                <div id="LeaderboardChanger" className="SidebarDescription">
                  <div id="LeaderboardTag">{tag.title}</div>
                  <div id="LeaderboardType">
                    {leaderboardType ? leaderboardType : "Leaderboard"}
                  </div>
                </div>
              </MemoizedMetaButton>
              {leaderboardTypeOpen && (
                <MultipleChoiceBtn choices={choices} close={leaderboardTypesToggle} />
              )}
              {leaderboardType && (
                <UsersStatusList
                  reputationsLoaded={props.reputationsLoaded}
                  reputationsWeeklyLoaded={props.reputationsWeeklyLoaded}
                  reputationsMonthlyLoaded={props.reputationsMonthlyLoaded}
                  reloadPermanentGrpah={props.reloadPermanentGrpah}
                  usersStatus={leaderboardType}
                />
              )}
            </>
          )}
        </div>
      </div> */
}
