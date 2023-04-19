import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Box, Button, CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";
import { NodeType } from "src/types";

import OptimizedAvatar from "@/components/OptimizedAvatar";
import { useNodeBook } from "@/context/NodeBookContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { getTypedCollections } from "@/lib/utils/getTypedCollections";
import { justADate } from "@/lib/utils/justADate";
import shortenNumber from "@/lib/utils/shortenNumber";

import { MemoizedMetaButton } from "../../MetaButton";
import ProposalItem from "../../ProposalsList/ProposalItem/ProposalItem";
import NodeTypeTrends from "../NodeTypeTrends";
import UseInfoTrends from "../UseInfoTrends";
import UserDetails from "../UserDetails";
import { SidebarWrapper } from "./SidebarWrapper";
import { NODE_TYPE_OPTIONS } from "./UserSettigsSidebar";

type UserInfoSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
};

type UserInfoTabs = {
  title: string;
  content: ReactNode;
};

type UserPoints = { positives: number; negatives: number; totalPoints: number };

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

  const nodeTypeStats = useMemo(() => {
    const stats = new Map(NODE_TYPE_OPTIONS.map(nodeType => [nodeType, "0"]));
    if (!sUserObj) return stats;
    stats.forEach((value, key) => {
      switch (key) {
        case "Concept":
          value = shortenNumber(sUserObj.cnCorrects - sUserObj.cnWrongs, 2, false);
          stats.set("Concept", value);
        case "Relation":
          value = shortenNumber(sUserObj.mCorrects - sUserObj.mWrongs, 2, false);
          stats.set("Relation", value);
        case "Reference":
          value = shortenNumber(sUserObj.rfCorrects - sUserObj.rfWrongs, 2, false);
          stats.set("Reference", value);
        case "Question":
          value = shortenNumber(sUserObj.qCorrects - sUserObj.qWrongs, 2, false);
          stats.set("Question", value);
        case "Idea":
          value = shortenNumber(sUserObj.iCorrects - sUserObj.iWrongs, 2, false);
          stats.set("Idea", value);
        case "Code":
          value = shortenNumber(sUserObj.cdCorrects - sUserObj.cdWrongs, 2, false);
          stats.set("Code", value);
      }
      console.log("map value", { value, key });
    });
    return stats;
  }, [sUserObj]);

  const loadOlderProposalsClick = useCallback(() => {
    if (lastIndex >= proposals.length) return;
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
  }, [lastIndex, proposals.length]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const a11yProps = (index: number) => {
    return {
      // id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };
  const tabsItems: UserInfoTabs[] = useMemo(() => {
    return !username
      ? []
      : [
          {
            title: "Trends",
            content: (
              <Box id="TrendsSettings" sx={{ p: "12px" }}>
                <Typography fontWeight={"500"}>Nodes Overwiew</Typography>
                <NodeTypeTrends nodeTypeStats={nodeTypeStats} />
                <Typography fontWeight={"500"} my="16px">
                  Proposals Overview
                </Typography>
                {!isRetrieving ? (
                  <UseInfoTrends proposalsPerDay={proposalsPerDay} theme={theme.toLowerCase() || ""} />
                ) : (
                  <Box sx={{ display: "grid", placeItems: "center" }}>
                    <CircularProgress />
                  </Box>
                )}
              </Box>
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

  const totalPoints = useMemo<UserPoints>(() => {
    if (!sUserObj) return { positives: 0, negatives: 0, totalPoints: 0 };

    const positiveKeys = ["cnCorrects", "mCorrects", "qCorrects", "iCorrects", "cdCorrects", "rfCorrects"];
    const negativeKeys = ["cnWrongs", "mWrongs", "qWrongs", "iWrongs", "cdWrongs", "rfWrongs"];

    const positives = positiveKeys.reduce((carry, pve) => carry + (sUserObj[pve] || 0), 0);
    const negatives = negativeKeys.reduce((carry, nve) => carry + (sUserObj[nve] || 0), 0);
    const totalPoints = positives - negatives;

    return {
      positives,
      negatives,
      totalPoints,
    };
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
          <Box p="0 32px 16px 32px">
            <UserDetails
              imageUrl={nodeBookState.selectedUser.imageUrl}
              fName={nodeBookState.selectedUser.fullName.split(" ")[0]}
              lName={nodeBookState.selectedUser.fullName.split(" ")[1] ?? ""}
              uname={nodeBookState.selectedUser.username}
              chooseUname={Boolean(nodeBookState.selectedUser.chooseUname)}
              points={totalPoints}
            />
            {sUserObj && (
              <>
                <div id="MiniUserPrifileInstitution" style={{ display: "flex", gap: "12px", borderRadius: "6px" }}>
                  <OptimizedAvatar
                    imageUrl={sUserObj.instLogo}
                    name={sUserObj.deInstit + " logo"}
                    sx={{
                      width: "20px",
                      height: "20px",
                      fontSize: "16px",
                    }}
                    renderAsAvatar={false}
                  />
                  <span>{sUserObj.deInstit}</span>
                </div>
                <div id="MiniUserPrifileTag">
                  <LocalOfferRoundedIcon
                    sx={{ marginRight: "8px" }}
                    id="tagChangeIcon"
                    className="material-icons deep-orange-text"
                  />
                  {sUserObj.tag}
                </div>
              </>
            )}
            <Button
              variant="contained"
              endIcon={<SendRoundedIcon sx={{ transform: "rotate(-45deg)" }} />}
              sx={{ backgroundColor: DESIGN_SYSTEM_COLORS.primary800, borderRadius: "24px", mt: "16px" }}
              fullWidth
            >
              Message
            </Button>
          </Box>

          <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"}>
            {tabsItems.map((tabItem: UserInfoTabs, idx: number) => (
              <Tab
                id={`user-info-${tabItem.title.toLowerCase()}`}
                key={tabItem.title}
                label={tabItem.title}
                {...a11yProps(idx)}
                sx={{ borderRadius: "6px", flex: 1 }}
              />
            ))}
          </Tabs>
        </Box>
      }
      contentSignalState={contentSignalState}
      SidebarContent={
        <Box>
          <Box sx={{ px: "10px", paddingTop: "10px" }}>{tabsItems[value].content}</Box>
        </Box>
      }
    />
  );
};
export const MemoizedUserInfoSidebar = React.memo(UserInfoSidebar);
