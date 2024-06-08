import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import { Box, CircularProgress, MenuItem, Select, Stack, Tab, Tabs, Typography } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Reputation, UserTheme } from "src/knowledgeTypes";

import OptimizedAvatar from "@/components/OptimizedAvatar";
import { getCollectionsQuery } from "@/lib/utils/getTypedCollections";
import { justADate } from "@/lib/utils/justADate";
import shortenNumber from "@/lib/utils/shortenNumber";

import { SelectedUser } from "../../../../nodeBookTypes";
import { MemoizedMetaButton } from "../../MetaButton";
import ProposalItem from "../../ProposalsList/ProposalItem/ProposalItem";
import NodeTypeTrends from "../NodeTypeTrends";
import UseInfoTrends from "../UseInfoTrends";
import UserDetails from "../UserDetails";
import { SidebarWrapper } from "./SidebarWrapper";
import { NODE_TYPE_OPTIONS, UserPoints } from "./UserSettigsSidebar";

type UserInfoSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  selectedUser: SelectedUser | null;
  username?: string;
};

type UserInfoTabs = {
  title: string;
  content: ReactNode;
};

// const NODE_TYPE_ARRAY: NodeType[] = ["Concept", "Code", "Relation", "Question", "Reference", "News", "Idea"];
const ELEMENTS_PER_PAGE = 13;
const UserInfoSidebar = ({ open, onClose, theme, openLinkedNode, username, selectedUser }: UserInfoSidebarProps) => {
  const [value, setValue] = React.useState(0);
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsPerDay, setProposalsPerDay] = useState<any[]>([]);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);
  const [sUserObj, setSUserObj] = useState<any | null>(null);
  const [type, setType] = useState<string>("all");

  const db = getFirestore();

  useEffect(() => {
    if (!db || !sUserObj) return;

    if ("deInstit" in sUserObj && !("instLogo" in sUserObj)) {
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
    if (!selectedUser) return;
    // if (!username) return;

    setIsRetrieving(true);
    const versions: { [key: string]: any } = {};

    const { versionsColl, userVersionsColl } = getCollectionsQuery(db);

    const versionCollectionRef = query(
      versionsColl,
      where("proposer", "==", selectedUser.username),
      where("deleted", "==", false)
    );

    const versionsData = await getDocs(versionCollectionRef);
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
        nodeType: versionData.nodeType,
      };
      delete versions[versionDoc.id].deleted;
      delete versions[versionDoc.id].updatedAt;
      if (username) {
        const userVersionCollectionRef = query(
          userVersionsColl,
          where("version", "==", versionDoc.id),
          where("user", "==", username)
        );
        userVersionsRefs.push(userVersionCollectionRef);
      }
    });

    // if (userVersionsRefs.length > 0) {
    //   await Promise.all(
    //     userVersionsRefs.map(async userVersionsRef => {
    //       const userVersionsDocs = await getDocs(userVersionsRef);
    //       userVersionsDocs.forEach((userVersionsDoc: any) => {
    //         const userVersion = userVersionsDoc.data();
    //         versionId = userVersion.version;
    //         delete userVersion.version;
    //         delete userVersion.updatedAt;
    //         delete userVersion.createdAt;
    //         delete userVersion.user;
    //         versions[versionId] = {
    //           ...versions[versionId],
    //           ...userVersion,
    //         };
    //       });
    //     })
    //   );
    // }

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
  }, [db, selectedUser, username]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!db) return;
      if (!selectedUser) return;

      const userRef = doc(db, "users", selectedUser.username);
      const userDoc = await getDoc(userRef);

      // const userDoc = await firebase.db.collection("users").doc(selectedUser).get();
      if (userDoc.exists()) {
        let userReputationData: any = {};
        const userData = userDoc.data();

        const reputationQuery = query(
          collection(db, "reputations"),
          where("uname", "==", selectedUser.username),
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
  }, [db, selectedUser]);

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
  const proposalsFiltered = useMemo(() => {
    if (type === "all") return proposals;

    return proposals.filter(proposal => proposal.nodeType === type);
  }, [proposals, type]);

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
                <UseInfoTrends proposalsPerDay={proposalsPerDay} theme={theme.toLowerCase() || ""} />
              </Box>
            ),
          },
          {
            title: "Proposals",
            content: (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} py="10px">
                  <Typography fontWeight={"500"}>Overview</Typography>

                  <Box>
                    <Typography sx={{ display: "inline-block" }}>Shows</Typography>
                    <Select
                      sx={{
                        marginLeft: "10px",
                        height: "35px",
                        width: "120px",
                      }}
                      MenuProps={{
                        sx: {
                          "& .MuiMenu-paper": {
                            backgroundColor: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : "#F9FAFB"),
                            color: "text.white",
                          },
                          "& .MuiMenuItem-root:hover": {
                            backgroundColor: theme => (theme.palette.mode === "dark" ? "##2F2F2F" : "#EAECF0"),
                            color: "text.white",
                          },
                          "& .Mui-selected": {
                            backgroundColor: "transparent!important",
                            color: "#FF8134",
                          },
                          "& .Mui-selected:hover": {
                            backgroundColor: "transparent",
                          },
                        },
                      }}
                      labelId="demo-select-small"
                      id="demo-select-small"
                      value={type}
                      onChange={e => {
                        setType(e.target.value);
                      }}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="Concept">Concepts</MenuItem>
                      <MenuItem value="Relation">Relations</MenuItem>
                      <MenuItem value="Question">Questions</MenuItem>
                      <MenuItem value="Idea">Ideas</MenuItem>
                      <MenuItem value="Code">Codes</MenuItem>
                      <MenuItem value="Reference">References</MenuItem>
                    </Select>
                  </Box>
                </Stack>
                <Stack spacing={"8px"}>
                  {proposalsFiltered.slice(0, lastIndex).map((proposal, idx) => {
                    return (
                      proposal.title && (
                        <ProposalItem key={idx} proposal={proposal} openLinkedNode={openLinkedNode} showTitle={true} />
                      )
                    );
                  })}
                </Stack>

                {proposalsFiltered.length > lastIndex && (
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
  }, [
    username,
    nodeTypeStats,
    proposalsPerDay,
    theme,
    type,
    proposalsFiltered,
    lastIndex,
    loadOlderProposalsClick,
    openLinkedNode,
  ]);

  const totalPoints = useMemo<UserPoints>(() => {
    if (!sUserObj) return { positives: 0, negatives: 0, totalPoints: 0, stars: 0 };

    const positiveKeys: (keyof Reputation)[] = [
      "cnCorrects",
      "mCorrects",
      "qCorrects",
      "iCorrects",
      "cdCorrects",
      "rfCorrects",
    ];
    const negativeKeys: (keyof Reputation)[] = ["cnWrongs", "mWrongs", "qWrongs", "iWrongs", "cdWrongs", "rfWrongs"];
    const starKeys: (keyof Reputation)[] = ["cnInst", "mInst", "qInst", "iInst", "cdInst", "rfInst"];

    const positives = positiveKeys.reduce(
      (carry, el) => carry + ((typeof sUserObj[el] === "number" && (sUserObj[el] as number)) || 0),
      0
    );
    const negatives = negativeKeys.reduce(
      (carry, el) => carry + ((typeof sUserObj[el] === "number" && (sUserObj[el] as number)) || 0),
      0
    );
    const stars = starKeys.reduce(
      (carry, el) => carry + ((typeof sUserObj[el] === "number" && (sUserObj[el] as number)) || 0),
      0
    );

    const totalPoints = positives + stars - negatives;

    return {
      positives: parseFloat(shortenNumber(positives, 2, false)),
      negatives: parseFloat(shortenNumber(negatives, 2, false)),
      stars: parseFloat(shortenNumber(stars, 2, false)),
      totalPoints: parseFloat(shortenNumber(totalPoints, 2, false)),
    };
  }, [sUserObj]);

  const contentSignalState = useMemo(() => {
    return { updated: true };
  }, [isRetrieving, tabsItems, value]);

  if (!selectedUser) return null;

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
              imageUrl={selectedUser.imageUrl}
              fName={selectedUser.fullName.split(" ")[0]}
              lName={selectedUser.fullName.split(" ")[1] ?? ""}
              uname={selectedUser.username}
              chooseUname={Boolean(selectedUser.chooseUname)}
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
        <Box height={"100%"}>
          <Box sx={{ px: "10px", paddingTop: "10px", height: "100%" }}>
            {!isRetrieving ? (
              tabsItems[value].content
            ) : (
              <Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
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
