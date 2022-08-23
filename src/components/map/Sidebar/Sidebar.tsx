// import "./Sidebar.css";

import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";

import referencesDarkTheme from "../../../../public/references-dark-theme.jpg";
import referencesLightTheme from "../../../../public/references-dark-theme.jpg";
// import LoadingImg from "../../../assets/AnimatediconLoop.gif";
import Proposals from "../Proposals";
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

const Sidebar = (props: any) => {
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

  const [selectionType] = useState("Proposals");
  const [openPresentations] = useState(false);
  const [openPendingProposals] = useState(false)
  const [openChat] = useState(false)
  const [openNotifications] = useState(false)
  const [openToolbar] = useState(false)
  const [tag] = useState(false)
  const [openSearch] = useState(false)
  const [openBookmarks] = useState(false)
  // const [leaderboardType, setLeaderboardType] = useState("Weekly");
  // const [leaderboardTypeOpen, setLeaderboardTypeOpen] = useState(false);

  const sidebarRef = useRef<any | null>(null);

  const scrollToTop = useCallback(
    () => { sidebarRef.current.scrollTop = 0; },
    [sidebarRef]
  );

  // const openSideBar = useCallback(
  //   (sidebarType) => {
  //     // console.log("In openSideBar");
  //     if (sidebarType === "PendingProposals") {
  //       setOpenPendingProposals(true);
  //     } else if (sidebarType === "UserInfo") {
  //       setOpenChat(true);
  //     } else if (sidebarType === "Notifications") {
  //       setOpenNotifications(true);
  //     } else if (sidebarType === "Presentations") {
  //       setOpenPresentations(true);
  //     } else if (sidebarType === "Chat") {
  //       setOpenChat(true);
  //     } else if (sidebarType === "UserSettings") {
  //       setOpenToolbar(true);
  //     } else if (sidebarType === "Search") {
  //       setOpenSearch(true);
  //     } else if (sidebarType === "Bookmarks") {
  //       setOpenBookmarks(true);
  //     } else if (sidebarType === "RecentNodes") {
  //       setOpenRecentNodes(true);
  //     } else if (sidebarType === "Trends") {
  //       setOpenTrends(true);
  //     } else if (sidebarType === "Media") {
  //       setOpenMedia(true);
  //     }
  //     const userOpenSidebarLogRef = firebase.db.collection("userOpenSidebarLog").doc();
  //     const userOpenSidebarLogObj = {
  //       uname: username,
  //       sidebarType,
  //       createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
  //     };
  //     if (selectedUser) {
  //       userOpenSidebarLogObj.selectedUser = selectedUser;
  //     }
  //     userOpenSidebarLogRef.set(userOpenSidebarLogObj);
  //   },
  //   [firebase, username, selectedUser]
  // );

  // const openSideBarClick = useCallback(
  //   (sidebarType) => (event) => {
  //     openSideBar(sidebarType);
  //     event.currentTarget.blur();
  //     event.stopPropagation();
  //   },[]
  // );

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

  const theme = 'Dark'

  return (
    <>
      {/* {openToolbar && tag && (
          <Toolbar openPractice={props.openPractice} setOpenPractice={props.setOpenPractice} />
      )} */}

      {/* sidebar menu here ------------ */}

      <div
        id="Sidebar"
        ref={sidebarRef}
        className={
          props.selectionType === "Proposals" ||
            props.selectionType === "AcceptedProposals" ||
            props.selectionType === "Comments" ||
            props.selectionType === "Citations" ||
            props.selectionType === "UserInfo" //||
            // openPendingProposals ||
            // openChat ||
            // openNotifications ||
            // openPresentations ||
            // openToolbar ||
            // openSearch ||
            // openBookmarks ||
            // openRecentNodes
            ? "active" : ""
        }
      >
        {/* side bar options */}
        <Suspense fallback={<div></div>}>
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
          ) : selectionType === "Proposals" ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Proposals"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <>
                <h4 style={{ textAlign: 'center' }}>-- Proposals Sidebar --</h4>
                <Proposals
                  proposeNodeImprovement={props.proposeNodeImprovement}
                  fetchProposals={props.fetchProposals}
                  rateProposal={props.rateProposal}
                  selectProposal={props.selectProposal}
                  deleteProposal={props.deleteProposal}
                  // editHistory={false}
                  proposeNewChild={props.proposeNewChild}
                />
              </>
            </MemoizedSidebarWrapper>
          ) : selectionType === "Comments" ? (
            <h3>Comments</h3>
          ) : openPendingProposals ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Pending Proposals"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <>
                <h4 style={{ textAlign: 'center' }}>-- Pending Proposals Sidebar --</h4>
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
          ) : openSearch ? (
            <MemoizedSidebarWrapper
              headerImage="" // CHECK: image
              title="Search Nodes"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              {/* CHECK: I commented this */}
              {/* <SearchList
                openLinkedNode={props.openLinkedNode}
                triggerQuerySearch={props.triggerQuerySearch}
              /> */}
              <h2>Search List</h2>
            </MemoizedSidebarWrapper>
          ) : openBookmarks ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme} //CHECK: CHANGE this images
              title="Bookmarks"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              {/* CHECK: I commented this */}
              {/* <Bookmarks openLinkedNode={props.openLinkedNode} /> */}
              <h2>Bookmarks here</h2>
            </MemoizedSidebarWrapper>
          ) : selectionType === "Citations" ? (
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
          ) : selectionType === "UserInfo" ? (
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



// --------------- side bar menu

{/* <div
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
            <MetaButton
              onClick={openSideBarClick("Trends")}
            // tooltip="Click to open the trends in proposals."
            // tooltipPosition="Right"
            >
              <img
                src={theme === "Light" ? LogoLightMode : LogoDarkMode}
                alt="1Logo"
                width="61px"
              />
            </MetaButton>
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
          <MetaButton
            onClick={openSideBarClick("Chat")}
          // tooltip="Click to open the chat room."
          // tooltipPosition="Right"
          >
            <i className="material-icons material-icons--outlined">forum</i>
            <span className="SidebarDescription">Chat</span>
          </MetaButton>
          {tag && (
            <>
              <MetaButton
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
              </MetaButton>
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
      </div> */}