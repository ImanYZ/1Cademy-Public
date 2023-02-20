import CodeIcon from "@mui/icons-material/Code";
import DoneIcon from "@mui/icons-material/Done";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { Box, CircularProgress, Tab, Tabs } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";
import { NodeType } from "src/types";

import OptimizedAvatar from "@/components/OptimizedAvatar";
import { useNodeBook } from "@/context/NodeBookContext";
import { getTypedCollections } from "@/lib/utils/getTypedCollections";
import { justADate } from "@/lib/utils/justADate";
import shortenNumber from "@/lib/utils/shortenNumber";

import { MemoizedMetaButton } from "../../MetaButton";
import ProposalItem from "../../ProposalsList/ProposalItem/ProposalItem";
import RoundImage from "../../RoundImage";
import UseInfoTrends from "../UseInfoTrends";
import { SidebarWrapper } from "./SidebarWrapper";

type UserInfoSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
};
const NODE_TYPE_ARRAY: NodeType[] = ["Concept", "Code", "Relation", "Question", "Reference", "News", "Idea"];
const ELEMENTS_PER_PAGE = 13;
const UserInfoSidebar = ({ open, onClose, theme, openLinkedNode, username }: UserInfoSidebarProps) => {
  const [value, setValue] = React.useState(0);
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsPerDay, setProposalsPerDay] = useState<any[]>([]);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);
  const [sUserObj, setSUserObj] = useState<any | null>(null);

  const db = getFirestore();
  const { nodeBookState } = useNodeBook();

  useEffect(() => {
    if (!db || !sUserObj) return;

    if ("deInstit" in sUserObj && !("instLogo" in sUserObj)) {
      // console.log("useEffect:", sUserObj);
      const fetchInstitution = async () => {
        const institutionsQuery = query(collection(db, "institutions"), where("name", "==", sUserObj.deInstit));

        const institutionsDocs = await getDocs(institutionsQuery);

        for (let institutionDoc of institutionsDocs.docs) {
          const institutionData = institutionDoc.data();
          setSUserObj((oldSUserObj: any) => {
            return { ...oldSUserObj, instLogo: institutionData.logoURL };
          });
        }
      };
      fetchInstitution();
    }
  }, [db, sUserObj]);

  const fetchProposals = useCallback(async () => {
    if (!nodeBookState.selectedUser) return;
    if (!username) return;

    setIsRetrieving(true);
    const versions: { [key: string]: any } = {};
    for (let nodeType of NODE_TYPE_ARRAY) {
      const { versionsColl, userVersionsColl } = getTypedCollections(db, nodeType);

      if (!versionsColl || !userVersionsColl) continue;

      const versionCollectionRef = query(
        versionsColl,
        where("proposer", "==", nodeBookState.selectedUser.username),
        where("deleted", "==", false)
      );

      const versionsData = await getDocs(versionCollectionRef);
      let versionId;
      const userVersionsRefs: any[] = [];
      versionsData.forEach(versionDoc => {
        const versionData = versionDoc.data();

        versions[versionDoc.id] = {
          ...versionData,
          id: versionDoc.id,
          createdAt: versionData.createdAt.toDate(),
          award: false,
          correct: false,
          wrong: false,
        };
        delete versions[versionDoc.id].deleted;
        delete versions[versionDoc.id].updatedAt;
        const userVersionCollectionRef = query(
          userVersionsColl,
          where("version", "==", versionDoc.id),
          where("user", "==", username)
        );
        userVersionsRefs.push(userVersionCollectionRef);
      });

      if (userVersionsRefs.length > 0) {
        await Promise.all(
          userVersionsRefs.map(async userVersionsRef => {
            const userVersionsDocs = await getDocs(userVersionsRef);
            userVersionsDocs.forEach((userVersionsDoc: any) => {
              const userVersion = userVersionsDoc.data();
              versionId = userVersion.version;
              delete userVersion.version;
              delete userVersion.updatedAt;
              delete userVersion.createdAt;
              delete userVersion.user;
              versions[versionId] = {
                ...versions[versionId],
                ...userVersion,
              };
            });
          })
        );
      }
    }

    const orderredProposals = Object.values(versions).sort(
      (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
    );
    const proposalsPerDayDict: { [key: string]: any } = {};
    for (let propo of orderredProposals) {
      let dateValue = justADate(new Date(propo.createdAt)).toISOString();
      if (dateValue in proposalsPerDayDict) {
        proposalsPerDayDict[dateValue].num++;
        proposalsPerDayDict[dateValue].netVotes += propo.corrects - propo.wrongs;
      } else {
        proposalsPerDayDict[dateValue] = {
          num: 1,
          netVotes: propo.corrects - propo.wrongs,
        };
      }
    }
    const proposalsPerDayList = [];
    for (let dateValue of Object.keys(proposalsPerDayDict)) {
      proposalsPerDayList.push({
        date: new Date(dateValue),
        num: proposalsPerDayDict[dateValue].num,
        netVotes: proposalsPerDayDict[dateValue].netVotes,
        averageVotes: proposalsPerDayDict[dateValue].netVotes / proposalsPerDayDict[dateValue].num,
      });
    }
    setProposals(orderredProposals);
    setProposalsPerDay(proposalsPerDayList);
    setIsRetrieving(false);
  }, [db, nodeBookState.selectedUser, username]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!db) return;
      if (!nodeBookState.selectedUser) return;

      const userRef = doc(db, "users", nodeBookState.selectedUser.username);
      const userDoc = await getDoc(userRef);

      // const userDoc = await firebase.db.collection("users").doc(selectedUser).get();
      if (userDoc.exists()) {
        let userReputationData: any = {};
        const userData = userDoc.data();

        const reputationQuery = query(
          collection(db, "reputations"),
          where("uname", "==", nodeBookState.selectedUser.username),
          where("tagId", "==", userData.tagId),
          limit(1)
        );
        const userReputationDoc = await getDocs(reputationQuery);
        if (userReputationDoc.docs.length > 0) {
          userReputationData = userReputationDoc.docs[0].data();
          delete userReputationData.uname;
          delete userData.tag;
        }
        if ("deInstit" in userData && !("instLogo" in userData)) {
          const institutionsQuery = query(collection(db, "institutions"), where("name", "==", userData.deInstit));
          const institutionsDocs = await getDocs(institutionsQuery);
          if (institutionsDocs.docs.length > 0) {
            const institutionData = institutionsDocs.docs[0].data();
            userData.instLogo = institutionData.logoURL;
          }
        }
        setSUserObj({ ...userReputationData, ...userData });
      }
    };
    fetchUserData();
  }, [db, nodeBookState.selectedUser]);

  const loadOlderProposalsClick = useCallback(() => {
    if (lastIndex >= proposals.length) return;
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
  }, [lastIndex, proposals.length]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };
  const tabsItems = useMemo(() => {
    return !username
      ? []
      : [
          {
            title: "Nodes",
            content: (
              <>
                <UseInfoTrends proposalsPerDay={proposalsPerDay} theme={theme || ""} />
              </>
            ),
          },
          {
            title: "Proposals",
            content: (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div className="ChartTitle">Proposals in chronological order</div>
                {proposals.slice(0, lastIndex).map((proposal, idx) => {
                  return (
                    proposal.title && (
                      <ProposalItem key={idx} proposal={proposal} openLinkedNode={openLinkedNode} showTitle={true} />
                    )
                  );
                })}
                {proposals.length > lastIndex && (
                  <div id="ContinueButton" style={{ padding: "10px 0px" }}>
                    <MemoizedMetaButton onClick={loadOlderProposalsClick}>
                      <>
                        <ExpandMoreIcon className="material-icons grey-text" />
                        Older Proposals
                        <ExpandMoreIcon className="material-icons grey-text" />
                      </>
                    </MemoizedMetaButton>
                  </div>
                )}
              </Box>
            ),
          },
        ];
  }, [lastIndex, loadOlderProposalsClick, proposals, proposalsPerDay, openLinkedNode, theme, username]);

  const totalPoints = useMemo(() => {
    if (!sUserObj) return 0;
    const positives = ["cnCorrects", "mCorrects", "qCorrects", "iCorrects", "cdCorrects", "rfCorrects"];
    const negatives = ["cnWrongs", "mWrongs", "qWrongs", "iWrongs", "cdWrongs", "rfWrongs"];
    const total =
      positives.reduce((carry, pve) => carry + (sUserObj[pve] || 0), 0) -
      negatives.reduce((carry, nve) => carry + (sUserObj[nve] || 0), 0);
    return shortenNumber(total, 2, false);
  }, [sUserObj]);

  const contentSignalState = useMemo(() => {
    return { updated: true };
  }, [isRetrieving, tabsItems, value]);

  if (!nodeBookState.selectedUser) return null;

  return (
    <SidebarWrapper
      id="sidebar-wrapper-user-info"
      title=""
      open={open}
      onClose={onClose}
      width={430}
      anchor="left"
      SidebarOptions={
        <Box
          sx={{
            borderBottom: 1,
            borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
            width: "100%",
            marginTop: "40px",
          }}
        >
          <div id="MiniUserPrifileHeader" className="MiniUserProfileHeaderMobile">
            <RoundImage imageUrl={nodeBookState.selectedUser.imageUrl} alt="1Cademist Profile Picture" />

            <div id="MiniUserPrifileIdentityUSettingSidebar" className="MiniUserPrifileIdentityMobile">
              <div id="MiniUserPrifileName">
                {nodeBookState.selectedUser.chooseUname
                  ? nodeBookState.selectedUser.username
                  : nodeBookState.selectedUser.fullName}
              </div>
              {sUserObj && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <LocalOfferIcon className="material-icons grey-text" />
                    <span>{sUserObj.tag}</span>
                  </Box>
                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <OptimizedAvatar
                      imageUrl={sUserObj.instLogo}
                      name={sUserObj.deInstit + " logo"}
                      sx={{
                        width: "25px",
                        height: "25px",
                        fontSize: "15px",
                      }}
                      renderAsAvatar={false}
                    />
                    <span>{sUserObj.deInstit}</span>
                  </Box>
                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <DoneIcon className="material-icons DoneIcon green-text" />
                    <span>{totalPoints}</span>
                  </Box>
                </Box>
              )}
            </div>
          </div>
          <div id="MiniUserPrifilePointsContainer" style={{ alignItems: "center", justifyContent: "space-around" }}>
            {sUserObj && (
              <>
                <div className="MiniUserProfilePoints">
                  <LocalLibraryIcon className="material-icons amber-text" />
                  <span className="ToolbarValue">
                    {shortenNumber((sUserObj.cnCorrects || 0) - (sUserObj.cnWrongs || 0), 2, false)}
                  </span>
                </div>
                <div className="MiniUserProfilePoints">
                  <ShareIcon className="material-icons amber-text" />
                  <span className="ToolbarValue">
                    {shortenNumber((sUserObj.mCorrects || 0) - (sUserObj.mWrongs || 0), 2, false)}
                  </span>
                </div>
                <div className="MiniUserProfilePoints">
                  <HelpOutlineIcon className="material-icons amber-text" />
                  <span className="ToolbarValue">
                    {shortenNumber((sUserObj.qCorrects || 0) - (sUserObj.qWrongs || 0), 2, false)}
                  </span>
                </div>
                <div className="MiniUserProfilePoints">
                  <EmojiObjectsIcon className="material-icons material-icons--outlined amber-text" />
                  <span className="ToolbarValue">
                    {shortenNumber(sUserObj.iCorrects || 0 - (sUserObj.iWrongs || 0), 2, false)}
                  </span>
                </div>
                <div className="MiniUserProfilePoints">
                  <CodeIcon className="material-icons amber-text" />
                  <span className="ToolbarValue">
                    {shortenNumber(sUserObj.cdCorrects || 0 - (sUserObj.cdWrongs || 0), 2, false)}
                  </span>
                </div>
                <div className="MiniUserProfilePoints">
                  <MenuBookIcon className="material-icons amber-text" />
                  <span className="ToolbarValue">
                    {shortenNumber((sUserObj.rfCorrects || 0) - (sUserObj.rfWrongs || 0), 2, false)}
                  </span>
                </div>
              </>
            )}
          </div>

          {!isRetrieving && (
            <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"}>
              {tabsItems.map((tabItem: any, idx: number) => (
                <Tab key={tabItem.title} label={tabItem.title} {...a11yProps(idx)} />
              ))}
            </Tabs>
          )}
        </Box>
      }
      contentSignalState={contentSignalState}
      SidebarContent={
        <Box>
          <Box sx={{ px: "10px", paddingTop: "10px" }}>
            {!isRetrieving ? (
              tabsItems[value].content
            ) : (
              <Box sx={{ display: "grid", placeItems: "center" }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Box>
      }
    />
  );
};
export const MemoizedUserInfoSidebar = React.memo(UserInfoSidebar);
