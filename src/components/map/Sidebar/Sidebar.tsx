import { Drawer } from '@mui/material';
import React, { Suspense, useRef } from 'react'

import referencesDarkTheme from "../../../../public/references-dark-theme.jpg";
import referencesLightTheme from "../../../../public/references-dark-theme.jpg";
import { SelectionType } from '../../../nodeBookTypes';
import Proposals from '../Proposals';
import { MemoizedSidebarWrapper } from './SidebarWrapper';

type ProposalSidebar = {
  // reputationsLoaded: any,
  // reputationsWeeklyLoaded: any,
  // reputationsMonthlyLoaded: any,
  // openLinkedNode: any,
  proposeNodeImprovement: any,
  fetchProposals: any,
  rateProposal: any,
  selectProposal: any,
  deleteProposal: any,
  closeSideBar: any,
  proposeNewChild: any,
  // reloadPermanentGrpah: any,
  // openPractice: any,
  // setOpenPractice: any,
  selectionType: SelectionType
}

const Sidebar = (props: ProposalSidebar) => {

  // const [openPresentations, setOpenPresentations] = useState(false);
  // const [selectionType] = useState(null);

  // const [openPendingProposals] = useState(false)
  // const [openChat] = useState(false)
  // const [openNotifications] = useState(false)
  // const [openToolbar] = useState(false)
  // const [tag] = useState(false)
  // const [openSearch] = useState(false)
  // const [openBookmarks] = useState(false)
  const sidebarRef = useRef(null);

  const theme = 'Dark'
  return (
    // <Drawer
    //   // sx={{
    //   //   width: drawerWidth,
    //   //   flexShrink: 0,
    //   //   '& .MuiDrawer-paper': {
    //   //     width: drawerWidth,
    //   //     boxSizing: 'border-box',
    //   //   },
    //   // }}
    //   variant="persistent"
    //   anchor="left"
    //   open={open}
    // >
    <>
      {/* {openToolbar && tag && (
          <Toolbar openPractice={props.openPractice} setOpenPractice={props.setOpenPractice} />
      )} */}

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
      <div
        id="Sidebar"
        ref={sidebarRef}
        // className="active"
        className={
          props.selectionType === "Proposals" ||
            props.selectionType === "AcceptedProposals" ||
            props.selectionType === "Comments" ||
            props.selectionType === "Citations" ||
            props.selectionType === "UserInfo" //||
            // CHECK: I commented this
            // openPendingProposals ||
            // openChat ||
            // openNotifications ||
            // openPresentations ||
            // openToolbar ||
            // openSearch ||
            // openBookmarks ||
            // openRecentNodes
            ? //  ||
            // openTrends
            "active"
            : ""
        }
      // style={
      //   selectedNode
      //     ? {
      //         WebkitBoxShadow: boxShadowCSS,
      //         MozBoxShadow: boxShadowCSS,
      //         boxShadow: boxShadowCSS
      //       }
      //     : {}
      // }
      >
        <Suspense fallback={<div></div>}>

          <MemoizedSidebarWrapper
            headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme}
            title="Proposals"
            scrollToTop={() => console.log('scrollToTop')}
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

          {/* {openPresentations ? (
            <MemoizedSidebarWrapper
              headerImage={theme === "Dark" ? PresentationsImage : PresentationsLightModeImage}
              title="Presentations"
              scrollToTop={scrollToTop}
              closeSideBar={props.closeSideBar}
            >
              <Presentations openLinkedNode={props.openLinkedNode} />
            </SidebarWrapper>
          ) : selectionType === "Proposals" ? (
            <SidebarWrapper
              headerImage={theme === "Dark" ? RefImage : RefLightModeImage}
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
            </SidebarWrapper>
          ) : // ) : selectionType === "AcceptedProposals" ? (
            //   <SidebarWrapper
            //     headerImage={theme === "Dark" ? RefImage : RefLightModeImage}
            //     title="Accepted Proposals"
            //     scrollToTop={scrollToTop}
            //     closeSideBar={props.closeSideBar}
            //   >
            //     <ProposalList
            //       proposeNodeImprovement={props.proposeNodeImprovement}
            //       fetchProposals={props.fetchProposals}
            //       rateProposal={props.rateProposal}
            //       selectProposal={props.selectProposal}
            //       deleteProposal={props.deleteProposal}
            //       editHistory={true}
            //       proposeNewChild={props.proposeNewChild}
            //     />
            //   </SidebarWrapper>
            selectionType === "Comments" ? (
              <h3>Comments</h3>
            ) : openPendingProposals ? (
              <SidebarWrapper
                headerImage={theme === "Dark" ? RefImage : RefLightModeImage}
                title="Pending Proposals"
                scrollToTop={scrollToTop}
                closeSideBar={props.closeSideBar}
              >
                <PendingProposalList openLinkedNode={props.openLinkedNode} />
              </SidebarWrapper>
            ) : openChat ? (
              <SidebarWrapper
                headerImage={ChatRoomImage}
                title="Chat Room!"
                scrollToTop={scrollToTop}
                closeSideBar={props.closeSideBar}
              >
                <ChatList openLinkedNode={props.openLinkedNode} />
              </SidebarWrapper>
            ) : openNotifications ? (
              <SidebarWrapper
                headerImage={theme === "Dark" ? NotificationsImage : NotificationsLightModeImage}
                title="Notifications"
                scrollToTop={scrollToTop}
                closeSideBar={props.closeSideBar}
              >
                <Notifications openLinkedNode={props.openLinkedNode} />
              </SidebarWrapper>
            ) : openToolbar && tag ? (
              <SidebarWrapper
                headerImage=""
                title=""
                scrollToTop={scrollToTop}
                closeSideBar={props.closeSideBar}
                noHeader={true}
              >
                <UserSettings
                  openPractice={props.openPractice}
                  setOpenPractice={props.setOpenPractice}
                />
              </SidebarWrapper>
            ) : openSearch ? (
              <SidebarWrapper
                headerImage={SearchImage}
                title="Search Nodes"
                scrollToTop={scrollToTop}
                closeSideBar={props.closeSideBar}
              >
                <SearchList
                  openLinkedNode={props.openLinkedNode}
                  triggerQuerySearch={props.triggerQuerySearch}
                />
              </SidebarWrapper>
            ) : openBookmarks ? (
              <SidebarWrapper
                headerImage={theme === "Dark" ? NewsWriters : BookmarksLightMode}
                title="Bookmarks"
                scrollToTop={scrollToTop}
                closeSideBar={props.closeSideBar}
              >
                <Bookmarks openLinkedNode={props.openLinkedNode} />
              </SidebarWrapper>
            ) : // openRecentNodes ? (
              //   <SidebarWrapper
              //     headerImage={
              //       theme === "Dark" ? RecentNodesImage : RecentNodesLightModeImage
              //     }
              //     title="Filter/Sort Nodes"
              //     scrollToTop={scrollToTop}
              //     closeSideBar={props.closeSideBar}
              //   >
              //     <RecentNodesList openLinkedNode={props.openLinkedNode} />
              //   </SidebarWrapper>
              // ) :  ) : openTrends ? (
              //   <SidebarWrapper
              //     headerImage={Trends}
              //     title="Trends"
              //     scrollToTop={scrollToTop}
              //     closeSideBar={props.closeSideBar}
              //   >
              //     <TrendsList />
              //   </SidebarWrapper>
              selectionType === "Citations" ? (
                <SidebarWrapper
                  headerImage={Citations}
                  title="Citing Nodes"
                  scrollToTop={scrollToTop}
                  closeSideBar={props.closeSideBar}
                >
                  <CitationsList openLinkedNode={props.openLinkedNode} />
                </SidebarWrapper>
              ) : selectionType === "UserInfo" ? (
                <SidebarWrapper
                  headerImage=""
                  title=""
                  scrollToTop={scrollToTop}
                  closeSideBar={props.closeSideBar}
                  noHeader={true}
                >
                  <UserInfo openLinkedNode={props.openLinkedNode} />
                </SidebarWrapper>
              ) : (
                <span />
              )} */}
        </Suspense>
      </div>
    </>
    // </Drawer>
  )
}

export const MemoizedSidebar = React.memo(Sidebar);

// import React, { useState, useRef, useCallback, useMemo, Suspense } from "react";
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
// import MetaButton from "../MetaButton/MetaButton";
// import MultipleChoiceBtn from "../MetaButton/MultipleChoiceBtn/MultipleChoiceBtn";
// import BookmarksButton from "./Bookmarks/BookmarksButton/BookmarksButton";
// import NotificationsButton from "./Notifications/NotificationsButton/NotificationsButton";
// import PresentationsButton from "./Presentations/PresentationsButton/PresentationsButton";
// import PendingProposalsButton from "./PendingProposals/PendingProposalsButton/PendingProposalsButton";
// import UserStatusIcon from "./UsersStatus/UserStatusIcon/UserStatusIcon";
// import UsersStatusList from "./UsersStatus/UsersStatusList/UsersStatusList";

// import RefImage from "../../../assets/References.jpg";
// import RefLightModeImage from "../../../assets/lightmode_pending.jpg";
// import ChatRoomImage from "../../../assets/ChatRoom.jpg";
// import NotificationsImage from "../../../assets/Notifications.jpg";
// import NotificationsLightModeImage from "../../../assets/lightmode_notif.jpg";
// import PresentationsImage from "../../../assets/darkmode_presentations.jpg";
// import PresentationsLightModeImage from "../../../assets/lightmode_presentations.jpg";
// import SearchImage from "../../../assets/Magnifier_Compas.jpg";
// import NewsWriters from "../../../assets/NewsWriters.jpg";
// import BookmarksLightMode from "../../../assets/lightmode_bookmarks.jpg";
// // import RecentNodesImage from "../../../assets/RecentNodes.jpg";
// // import RecentNodesLightModeImage from "../../../assets/lightmode_sort.jpg";
// import Citations from "../../../assets/Citations.jpg";
// import LogoDarkMode from "../../../assets/DarkModeLogo.svg";
// import LogoLightMode from "../../../assets/LightModeLogo.svg";
// import LoadingImg from "../../../assets/AnimatediconLoop.gif";

// import "./Sidebar.css";

// const Proposals = React.lazy(() => import("./Proposals/Proposals/Proposals"));
// const PendingProposalList = React.lazy(() =>
//   import("./PendingProposals/PendingProposalList/PendingProposalList")
// );
// const ChatList = React.lazy(() => import("./ChatRoom/ChatList/ChatList"));
// const Notifications = React.lazy(() => import("./Notifications/Notifications/Notifications"));
// const Presentations = React.lazy(() =>
//   import("./Presentations/PresentationsList/PresentationsList")
// );
// const UserSettings = React.lazy(() => import("./UserSettings/UserSettings"));
// const SearchList = React.lazy(() => import("./Search/SearchList/SearchList"));
// const Bookmarks = React.lazy(() => import("./Bookmarks/Bookmarks/Bookmarks"));
// // const RecentNodesList = React.lazy(() => import("./RecentNodes/RecentNodesList/RecentNodesList"));
// const CitationsList = React.lazy(() => import("./Citations/Citations"));
// const UserInfo = React.lazy(() => import("./UsersStatus/UserInfo/UserInfo"));

// const lBTypes = ["Weekly", "Monthly", "All Time", "Others' Votes", "Others Monthly"];

// const Sidebar = (props) => {
//   const firebase = useRecoilValue(firebaseState);
//   const isOnline = useRecoilValue(isOnlineState);
//   const username = useRecoilValue(usernameState);
//   const imageUrl = useRecoilValue(imageUrlState);
//   const fName = useRecoilValue(fNameState);
//   const lName = useRecoilValue(lNameState);
//   const chooseUname = useRecoilValue(chooseUnameState);
//   const tag = useRecoilValue(tagState);

//   const totalPoints = useRecoilValue(totalPointsState);
//   const Positivess = useRecoilValue(positivesState);
//   const Negatives = useRecoilValue(negativesState);
//   // for Concept nodes
//   const cnCorrects = useRecoilValue(cnCorrectsState);
//   const cnWrongs = useRecoilValue(cnWrongsState);
//   const cnInst = useRecoilValue(cnInstState);
//   // for Code nodes
//   const cdCorrects = useRecoilValue(cdCorrectsState);
//   const cdWrongs = useRecoilValue(cdWrongsState);
//   const cdInst = useRecoilValue(cdInstState);
//   // for Question nodes
//   const qCorrects = useRecoilValue(qCorrectsState);
//   const qWrongs = useRecoilValue(qWrongsState);
//   const qInst = useRecoilValue(qInstState);
//   //  for Profile nodes
//   const pCorrects = useRecoilValue(pCorrectsState);
//   const pWrongs = useRecoilValue(pWrongsState);
//   const pInst = useRecoilValue(pInstState);
//   //  for Sequel nodes
//   const sCorrects = useRecoilValue(sCorrectsState);
//   const sWrongs = useRecoilValue(sWrongsState);
//   const sInst = useRecoilValue(sInstState);
//   //  for Advertisement nodes
//   const aCorrects = useRecoilValue(aCorrectsState);
//   const aWrongs = useRecoilValue(aWrongsState);
//   const aInst = useRecoilValue(aInstState);
//   //  for Reference nodes
//   const rfCorrects = useRecoilValue(rfCorrectsState);
//   const rfWrongs = useRecoilValue(rfWrongsState);
//   const rfInst = useRecoilValue(rfInstState);
//   //  for News nodes
//   const nCorrects = useRecoilValue(nCorrectsState);
//   const nWrongs = useRecoilValue(nWrongsState);
//   const nInst = useRecoilValue(nInstState);
//   //  for Relation Nodes
//   const mCorrects = useRecoilValue(mCorrectsState);
//   const mWrongs = useRecoilValue(mWrongsState);
//   const mInst = useRecoilValue(mInstState);
//   //  for Idea nodes
//   const iCorrects = useRecoilValue(iCorrectsState);
//   const iWrongs = useRecoilValue(iWrongsState);
//   const iInst = useRecoilValue(iInstState);

//   const lterm = useRecoilValue(ltermState);
//   const selectionType = useRecoilValue(selectionTypeState);
//   const [openPendingProposals, setOpenPendingProposals] = useRecoilState(openPendingProposalsState);
//   const [openChat, setOpenChat] = useRecoilState(openChatState);
//   const [openNotifications, setOpenNotifications] = useRecoilState(openNotificationsState);
//   const [openPresentations, setOpenPresentations] = useRecoilState(openPresentationsState);
//   const [openToolbar, setOpenToolbar] = useRecoilState(openToolbarState);
//   const [openSearch, setOpenSearch] = useRecoilState(openSearchState);
//   const [openBookmarks, setOpenBookmarks] = useRecoilState(openBookmarksState);
//   const [openRecentNodes, setOpenRecentNodes] = useRecoilState(openRecentNodesState);
//   const [openTrends, setOpenTrends] = useRecoilState(openTrendsState);
//   const [openMedia, setOpenMedia] = useRecoilState(openMediaState);
//   const selectedUser = useRecoilValue(selectedUserState);
//   const theme = useRecoilValue(themeState);

//   const [leaderboardType, setLeaderboardType] = useState("Weekly");
//   const [leaderboardTypeOpen, setLeaderboardTypeOpen] = useState(false);

//   const sidebarRef = useRef(null);

//   const scrollToTop = useCallback(
//     (event) => {
//       sidebarRef.current.scrollTop = 0;
//     },
//     [sidebarRef]
//   );

//   const openSideBar = useCallback(
//     (sidebarType) => {
//       // console.log("In openSideBar");
//       if (sidebarType === "PendingProposals") {
//         setOpenPendingProposals(true);
//       } else if (sidebarType === "UserInfo") {
//         setOpenChat(true);
//       } else if (sidebarType === "Notifications") {
//         setOpenNotifications(true);
//       } else if (sidebarType === "Presentations") {
//         setOpenPresentations(true);
//       } else if (sidebarType === "Chat") {
//         setOpenChat(true);
//       } else if (sidebarType === "UserSettings") {
//         setOpenToolbar(true);
//       } else if (sidebarType === "Search") {
//         setOpenSearch(true);
//       } else if (sidebarType === "Bookmarks") {
//         setOpenBookmarks(true);
//       } else if (sidebarType === "RecentNodes") {
//         setOpenRecentNodes(true);
//       } else if (sidebarType === "Trends") {
//         setOpenTrends(true);
//       } else if (sidebarType === "Media") {
//         setOpenMedia(true);
//       }
//       const userOpenSidebarLogRef = firebase.db.collection("userOpenSidebarLog").doc();
//       const userOpenSidebarLogObj = {
//         uname: username,
//         sidebarType,
//         createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
//       };
//       if (selectedUser) {
//         userOpenSidebarLogObj.selectedUser = selectedUser;
//       }
//       userOpenSidebarLogRef.set(userOpenSidebarLogObj);
//     },
//     [firebase, username, selectedUser]
//   );

//   const openSideBarClick = useCallback(
//     (sidebarType) => (event) => {
//       openSideBar(sidebarType);
//       event.currentTarget.blur();
//       event.stopPropagation();
//     },
//     []
//   );

//   // const setUsersStatusClick = useCallback(
//   //   (event) => {
//   //     const usersStatusStates = ["Weekly", "Monthly", "All Time", false];
//   //     setUsersStatus((oldUsersStatus) => {
//   //       let oldStatusIdx = usersStatusStates.findIndex((uStatus) => uStatus === oldUsersStatus);
//   //       if (oldStatusIdx === usersStatusStates.length - 1) {
//   //         oldStatusIdx = 0;
//   //       } else {
//   //         oldStatusIdx++;
//   //       }
//   //       const userLeaderboardLogRef = firebase.db.collection("userLeaderboardLog").doc();
//   //       userLeaderboardLogRef.set({
//   //         uname: username,
//   //         type: usersStatusStates[oldStatusIdx],
//   //         createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
//   //       });
//   //       return usersStatusStates[oldStatusIdx];
//   //     });
//   //   },
//   //   [firebase, username]
//   // );

//   const leaderboardTypesToggle = useCallback((event) => {
//     setLeaderboardTypeOpen((oldCLT) => !oldCLT);
//   }, []);

//   const changeLeaderboard = useCallback(
//     (lBType) => (event) => {
//       setLeaderboardType(lBType);
//       setLeaderboardTypeOpen(false);
//       const userLeaderboardLogRef = firebase.db.collection("userLeaderboardLog").doc();
//       userLeaderboardLogRef.set({
//         uname: username,
//         type: lBType,
//         createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
//       });
//     },
//     [firebase, username]
//   );

//   const choices = useMemo(
//     () =>
//       lBTypes.map((lBType) => {
//         return { label: lBType, choose: changeLeaderboard(lBType) };
//       }),
//     [changeLeaderboard]
//   );

//   // const boxShadowCSS = boxShadowCSSGenerator(selectionType);
//   return (
//     <>
//       {/* {openToolbar && tag && (
//           <Toolbar openPractice={props.openPractice} setOpenPractice={props.setOpenPractice} />
//       )} */}
//       <div
//         id="SidebarButtonsContainer"
//         style={
//           selectionType ||
//           openPendingProposals ||
//           openChat ||
//           openNotifications ||
//           openPresentations ||
//           openToolbar ||
//           openSearch ||
//           openBookmarks ||
//           openRecentNodes ||
//           openTrends ||
//           openMedia
//             ? { display: "none" }
//             : undefined
//         }
//       >
//         <div id="SidebarButtons">
//           <div className="Logo">
//             <MetaButton
//               onClick={openSideBarClick("Trends")}
//               // tooltip="Click to open the trends in proposals."
//               // tooltipPosition="Right"
//             >
//               <img
//                 src={theme === "Light" ? LogoLightMode : LogoDarkMode}
//                 alt="1Logo"
//                 width="61px"
//               />
//             </MetaButton>
//           </div>
//           <UserStatusIcon
//             uname={username}
//             totalPoints={totalPoints}
//             totalPositives={Positivess}
//             totalNegatives={Negatives}
//             imageUrl={imageUrl}
//             fullname={fName + " " + lName}
//             chooseUname={chooseUname}
//             online={isOnline}
//             inUserBar={true}
//             inNodeFooter={false}
//             reloadPermanentGrpah={props.reloadPermanentGrpah}
//           />
//           <Button id="SearchButton" onClick={openSideBarClick("Search")}>
//             <SearchIcon />
//             {/* <div className="SearchIcon">🔍</div> */}
//             <span className="SidebarDescription">Search</span>
//             {/* <span className="TooltipText Right">
//               Click to open the Search bar.
//             </span> */}
//           </Button>
//           {/* <SearchButton allNodesRetrieving={nodesRetrieving} /> */}
//           <NotificationsButton openSideBar={openSideBar} />
//           <BookmarksButton openSideBar={openSideBar} />
//           <PendingProposalsButton openSideBar={openSideBar} />
//           {/* <MetaButton
//             onClick={openSideBarClick("RecentNodes")}
//             // tooltip="Click to open the most recent nodes."
//             // tooltipPosition="Right"
//           >
//             <i className="material-icons">filter_list</i>
//             <span className="SidebarDescription">Filter</span>
//           </MetaButton> */}
//           {/* <RecentNodesButton
//             allUserNodesRetrieving={userNodesRetrieving}
//           /> */}
//           {/* <MetaButton
//             onClick={openSideBarClick("Trends")}
//             // tooltip="Click to open the trends in proposals."
//             // tooltipPosition="Right"
//           >
//             <i className="material-icons">trending_up</i>
//             <span className="SidebarDescription">Trends</span>
//           </MetaButton> */}
//           {/* <TrendsButton /> */}
//           {/* <MetaButton
//             onClick={showHideClusters}
//             // tooltip="Click to open the Clusters boundaries."
//             // tooltipPosition="Right"
//           >
//             <i className={"material-icons" + (showClusters ? " Striked" : "")}>
//               highlight_alt
//             </i>
//             <span
//               className={
//                 "SidebarDescription" + (showClusters ? " Striked" : "")
//               }
//             >
//               Clusters
//             </span>
//           </MetaButton> */}
//           {/* <ClustersButton /> */}
//           <PresentationsButton openSideBar={openSideBar} />
//           <MetaButton
//             onClick={openSideBarClick("Chat")}
//             // tooltip="Click to open the chat room."
//             // tooltipPosition="Right"
//           >
//             <i className="material-icons material-icons--outlined">forum</i>
//             <span className="SidebarDescription">Chat</span>
//           </MetaButton>
//           {tag && (
//             <>
//               {/* <MetaButton> */}
//               {/* <i className="material-icons grey-text">local_offer</i> */}
//               {/* <div className="LeaderbaordIcon">🏆</div>
//                 {usersStatus && !props.reputationsLoaded && (
//                   <div className="preloader-wrapper small active">
//                     <div className="spinner-layer spinner-yellow-only">
//                       <div className="circle-clipper left">
//                         <div className="circle"></div>
//                       </div>
//                       <div className="gap-patch">
//                         <div className="circle"></div>
//                       </div>
//                       <div className="circle-clipper right">
//                         <div className="circle"></div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 <span className="SidebarDescription">{tag.title}</span> */}
//               {/* </MetaButton> */}
//               <MetaButton
//                 onClick={leaderboardTypesToggle}
//                 // tooltip={
//                 //   "Click to " +
//                 //   (props.usersStatus ? "hide" : "show") +
//                 //   " the user contribution trends."
//                 // }
//                 // tooltipPosition="Right"
//               >
//                 <div className="LeaderbaordIcon">🏆</div>
//                 {!props.reputationsLoaded && (
//                   <div className="preloader-wrapper small active">
//                     <div className="spinner-layer spinner-yellow-only">
//                       <div className="circle-clipper left">
//                         <div className="circle"></div>
//                       </div>
//                       <div className="gap-patch">
//                         <div className="circle"></div>
//                       </div>
//                       <div className="circle-clipper right">
//                         <div className="circle"></div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {/* <i className="material-icons">published_with_changes</i> */}
//                 <div id="LeaderboardChanger" className="SidebarDescription">
//                   <div id="LeaderboardTag">{tag.title}</div>
//                   <div id="LeaderboardType">
//                     {leaderboardType ? leaderboardType : "Leaderboard"}
//                   </div>
//                 </div>
//               </MetaButton>
//               {leaderboardTypeOpen && (
//                 <MultipleChoiceBtn choices={choices} close={leaderboardTypesToggle} />
//               )}
//               {leaderboardType && (
//                 <UsersStatusList
//                   reputationsLoaded={props.reputationsLoaded}
//                   reputationsWeeklyLoaded={props.reputationsWeeklyLoaded}
//                   reputationsMonthlyLoaded={props.reputationsMonthlyLoaded}
//                   reloadPermanentGrpah={props.reloadPermanentGrpah}
//                   usersStatus={leaderboardType}
//                 />
//               )}
//             </>
//           )}
//         </div>
//       </div>
//       <div
//         id="Sidebar"
//         ref={sidebarRef}
//         className={
//           selectionType === "Proposals" ||
//           selectionType === "AcceptedProposals" ||
//           selectionType === "Comments" ||
//           selectionType === "Citations" ||
//           selectionType === "UserInfo" ||
//           openPendingProposals ||
//           openChat ||
//           openNotifications ||
//           openPresentations ||
//           openToolbar ||
//           openSearch ||
//           openBookmarks ||
//           openRecentNodes
//             ? //  ||
//               // openTrends
//               "active"
//             : ""
//         }
//         // style={
//         //   selectedNode
//         //     ? {
//         //         WebkitBoxShadow: boxShadowCSS,
//         //         MozBoxShadow: boxShadowCSS,
//         //         boxShadow: boxShadowCSS
//         //       }
//         //     : {}
//         // }
//       >
//         <Suspense fallback={<div></div>}>
//           {openPresentations ? (
//             <SidebarWrapper
//               headerImage={theme === "Dark" ? PresentationsImage : PresentationsLightModeImage}
//               title="Presentations"
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//             >
//               <Presentations openLinkedNode={props.openLinkedNode} />
//             </SidebarWrapper>
//           ) : selectionType === "Proposals" ? (
//             <SidebarWrapper
//               headerImage={theme === "Dark" ? RefImage : RefLightModeImage}
//               title="Proposals"
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//             >
//               <Proposals
//                 proposeNodeImprovement={props.proposeNodeImprovement}
//                 fetchProposals={props.fetchProposals}
//                 rateProposal={props.rateProposal}
//                 selectProposal={props.selectProposal}
//                 deleteProposal={props.deleteProposal}
//                 // editHistory={false}
//                 proposeNewChild={props.proposeNewChild}
//               />
//             </SidebarWrapper>
//           ) : // ) : selectionType === "AcceptedProposals" ? (
//           //   <SidebarWrapper
//           //     headerImage={theme === "Dark" ? RefImage : RefLightModeImage}
//           //     title="Accepted Proposals"
//           //     scrollToTop={scrollToTop}
//           //     closeSideBar={props.closeSideBar}
//           //   >
//           //     <ProposalList
//           //       proposeNodeImprovement={props.proposeNodeImprovement}
//           //       fetchProposals={props.fetchProposals}
//           //       rateProposal={props.rateProposal}
//           //       selectProposal={props.selectProposal}
//           //       deleteProposal={props.deleteProposal}
//           //       editHistory={true}
//           //       proposeNewChild={props.proposeNewChild}
//           //     />
//           //   </SidebarWrapper>
//           selectionType === "Comments" ? (
//             <h3>Comments</h3>
//           ) : openPendingProposals ? (
//             <SidebarWrapper
//               headerImage={theme === "Dark" ? RefImage : RefLightModeImage}
//               title="Pending Proposals"
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//             >
//               <PendingProposalList openLinkedNode={props.openLinkedNode} />
//             </SidebarWrapper>
//           ) : openChat ? (
//             <SidebarWrapper
//               headerImage={ChatRoomImage}
//               title="Chat Room!"
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//             >
//               <ChatList openLinkedNode={props.openLinkedNode} />
//             </SidebarWrapper>
//           ) : openNotifications ? (
//             <SidebarWrapper
//               headerImage={theme === "Dark" ? NotificationsImage : NotificationsLightModeImage}
//               title="Notifications"
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//             >
//               <Notifications openLinkedNode={props.openLinkedNode} />
//             </SidebarWrapper>
//           ) : openToolbar && tag ? (
//             <SidebarWrapper
//               headerImage=""
//               title=""
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//               noHeader={true}
//             >
//               <UserSettings
//                 openPractice={props.openPractice}
//                 setOpenPractice={props.setOpenPractice}
//               />
//             </SidebarWrapper>
//           ) : openSearch ? (
//             <SidebarWrapper
//               headerImage={SearchImage}
//               title="Search Nodes"
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//             >
//               <SearchList
//                 openLinkedNode={props.openLinkedNode}
//                 triggerQuerySearch={props.triggerQuerySearch}
//               />
//             </SidebarWrapper>
//           ) : openBookmarks ? (
//             <SidebarWrapper
//               headerImage={theme === "Dark" ? NewsWriters : BookmarksLightMode}
//               title="Bookmarks"
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//             >
//               <Bookmarks openLinkedNode={props.openLinkedNode} />
//             </SidebarWrapper>
//           ) : // openRecentNodes ? (
//           //   <SidebarWrapper
//           //     headerImage={
//           //       theme === "Dark" ? RecentNodesImage : RecentNodesLightModeImage
//           //     }
//           //     title="Filter/Sort Nodes"
//           //     scrollToTop={scrollToTop}
//           //     closeSideBar={props.closeSideBar}
//           //   >
//           //     <RecentNodesList openLinkedNode={props.openLinkedNode} />
//           //   </SidebarWrapper>
//           // ) :  ) : openTrends ? (
//           //   <SidebarWrapper
//           //     headerImage={Trends}
//           //     title="Trends"
//           //     scrollToTop={scrollToTop}
//           //     closeSideBar={props.closeSideBar}
//           //   >
//           //     <TrendsList />
//           //   </SidebarWrapper>
//           selectionType === "Citations" ? (
//             <SidebarWrapper
//               headerImage={Citations}
//               title="Citing Nodes"
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//             >
//               <CitationsList openLinkedNode={props.openLinkedNode} />
//             </SidebarWrapper>
//           ) : selectionType === "UserInfo" ? (
//             <SidebarWrapper
//               headerImage=""
//               title=""
//               scrollToTop={scrollToTop}
//               closeSideBar={props.closeSideBar}
//               noHeader={true}
//             >
//               <UserInfo openLinkedNode={props.openLinkedNode} />
//             </SidebarWrapper>
//           ) : (
//             <span />
//           )}
//         </Suspense>
//       </div>
//     </>
//   );
// };

// export default React.memo(Sidebar);
