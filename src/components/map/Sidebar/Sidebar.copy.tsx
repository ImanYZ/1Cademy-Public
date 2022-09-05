import React, { Suspense, useRef } from "react";

import referencesDarkTheme from "../../../../public/references-dark-theme.jpg";
import referencesLightTheme from "../../../../public/references-dark-theme.jpg";
import { SelectionType } from "../../../nodeBookTypes";
import Proposals from "../Proposals";
import { MemoizedSidebarWrapper } from "./SidebarWrapper";

type ProposalSidebar = {
  // reputationsLoaded: any,
  // reputationsWeeklyLoaded: any,
  // reputationsMonthlyLoaded: any,
  // openLinkedNode: any,
  proposeNodeImprovement: any;
  fetchProposals: any;
  rateProposal: any;
  selectProposal: any;
  deleteProposal: any;
  closeSideBar: any;
  proposeNewChild: any;
  // reloadPermanentGrpah: any,
  // openPractice: any,
  // setOpenPractice: any,
  selectionType: SelectionType;
};

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

  const theme = "Dark";
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
            ? // CHECK: I commented this
              // openPendingProposals ||
              // openChat ||
              // openNotifications ||
              // openPresentations ||
              // openToolbar ||
              // openSearch ||
              // openBookmarks ||
              // openRecentNodes
              //  ||
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
            scrollToTop={() => console.log("scrollToTop")}
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
  );
};

export const MemoizedSidebar = React.memo(Sidebar);
