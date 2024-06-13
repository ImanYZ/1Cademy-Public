import { Box, MenuItem, Select, Tab, Tabs, Typography } from "@mui/material";
import { Firestore } from "firebase/firestore";
import NextImage from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { getProposalsSnapshot } from "src/client/firestore/proposals.firesrtore";
import { getUserProposalsSnapshot } from "src/client/firestore/userProposals.firestore";
import { UserTheme } from "src/knowledgeTypes";

import NoProposalDarkIcon from "../../../../../public/no-proposals-dark-mode.svg";
import NoProposalLightIcon from "../../../../../public/no-proposals-light-mode.svg";
import { newId } from "../../../../lib/utils/newFirestoreId";
import ProposalsList from "../../ProposalsList/ProposalsList";
import { SidebarWrapper } from "./SidebarWrapper";

type ProposalsSidebarProps = {
  open: boolean;
  onClose: () => void;
  clearInitialProposal: () => void;
  initialProposal: string | null;
  nodeLoaded: boolean;
  theme: UserTheme;
  proposeNodeImprovement: any;
  rateProposal: any;
  ratingProposal: boolean;
  selectProposal: any;
  deleteProposal: any;
  proposeNewChild: any;
  openProposal: any;
  selectedNode: string | null;
  db: Firestore;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
  username: string;
};

const ProposalsSidebar = ({
  open,
  onClose,
  clearInitialProposal,
  initialProposal,
  theme,
  proposeNodeImprovement,
  rateProposal,
  ratingProposal,
  selectProposal,
  deleteProposal,
  proposeNewChild,
  openProposal,
  db,
  sidebarWidth,
  innerHeight,
  innerWidth,
  selectedNode,
  username,
}: ProposalsSidebarProps) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [userVotesOnProposals, setUserVotesOnProposals] = useState<{ [key: string]: any }>({});
  const [value, setValue] = React.useState(0);
  const [type, setType] = useState<string>("all");

  const handleSwitchTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  // const userVersionsRefs: Query<DocumentData>[] = [];
  // const versionsCommentsRefs: Query<DocumentData>[] = [];
  // const userVersionsCommentsRefs: Query<DocumentData>[] = [];
  // versionsData.forEach(versionDoc => {
  //   versionIds.push(versionDoc.id);
  //   const versionData = versionDoc.data();

  //   versions[versionDoc.id] = {
  //     ...versionData,
  //     nodeType: versionData.nodeType,
  //     id: versionDoc.id,
  //     createdAt: versionData.createdAt.toDate(),
  //     award: false,
  //     correct: false,
  //     wrong: false,
  //     comments: [],
  //   };
  //   delete versions[versionDoc.id].deleted;
  //   delete versions[versionDoc.id].updatedAt;
  //   delete versions[versionDoc.id].node;
  //   const userVersionsQuery = query(
  //     userVersionsColl,
  //     where("version", "==", versionDoc.id),
  //     where("user", "==", user.uname)
  //   );
  //   userVersionsRefs.push(userVersionsQuery);
  //   const versionsCommentsQuery = query(
  //     versionsCommentsColl,
  //     where("version", "==", versionDoc.id),
  //     where("deleted", "==", false)
  //   );
  //   versionsCommentsRefs.push(versionsCommentsQuery);
  // });
  // console.log(nodeLoaded, "nodeLoaded");
  // if (userVersionsRefs.length > 0) {
  //   await Promise.all(
  //     userVersionsRefs.map(async userVersionsRef => {
  //       const userVersionsDocs = await getDocs(userVersionsRef);
  //       userVersionsDocs.forEach(userVersionsDoc => {
  //         const userVersion = userVersionsDoc.data();
  //         versionId = userVersion.version;
  //         delete userVersion.version;
  //         delete userVersion.updatedAt;
  //         delete userVersion.createdAt;
  //         delete userVersion.user;
  //         if (userVersion.hasOwnProperty("id")) {
  //           delete userVersion.id;
  //         }
  //         versions[versionId] = {
  //           ...versions[versionId],
  //           ...userVersion,
  //         };
  //       });
  //     })
  //   );
  // }

  // build version comments {}
  // if (versionsCommentsRefs.length > 0) {
  //   await Promise.all(
  //     versionsCommentsRefs.map(async versionsCommentsRef => {
  //       const versionsCommentsDocs = await getDocs(versionsCommentsRef);
  //       versionsCommentsDocs.forEach(versionsCommentsDoc => {
  //         const versionsComment = versionsCommentsDoc.data();
  //         delete versionsComment.updatedAt;
  //         comments[versionsCommentsDoc.id] = {
  //           ...versionsComment,
  //           id: versionsCommentsDoc.id,
  //           createdAt: versionsComment.createdAt.toDate(),
  //         };
  //         const userVersionsCommentsQuery = query(
  //           userVersionsCommentsColl,
  //           where("versionComment", "==", versionsCommentsDoc.id),
  //           where("user", "==", user.uname)
  //         );

  //         userVersionsCommentsRefs.push(userVersionsCommentsQuery);
  //       });
  //     })
  //   );

  //   // merge comments and userVersionComment
  //   if (userVersionsCommentsRefs.length > 0) {
  //     await Promise.all(
  //       userVersionsCommentsRefs.map(async userVersionsCommentsRef => {
  //         const userVersionsCommentsDocs = await getDocs(userVersionsCommentsRef);
  //         userVersionsCommentsDocs.forEach(userVersionsCommentsDoc => {
  //           const userVersionsComment = userVersionsCommentsDoc.data();
  //           const versionCommentId = userVersionsComment.versionComment;
  //           delete userVersionsComment.versionComment;
  //           delete userVersionsComment.updatedAt;
  //           delete userVersionsComment.createdAt;
  //           delete userVersionsComment.user;
  //           comments[versionCommentId] = {
  //             ...comments[versionCommentId],
  //             ...userVersionsComment,
  //           };
  //         });
  //       })
  //     );
  //   }
  // }
  // Object.values(comments).forEach((comment: any) => {
  //   versionId = comment.version;
  //   delete comment.version;
  //   versions[versionId].comments.push(comment);
  // });

  // const versions: any = {};

  // const proposalsTemp = Object.values(versions);
  // const orderedProposals = proposalsTemp.sort(
  //   (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
  // );

  useEffect(() => {
    if (!selectedNode) return;

    const onSynchronize = (changes: any) => {
      setUserVotesOnProposals((prev: any) =>
        changes.reduce((prev: { [versionId: string]: any }, change: any) => {
          const docType = change.type;
          const curData = {
            ...change.data,
            createdAt: change.data.createdAt.toDate(),
            comments: [],
          } as any & { id: string };

          if (docType === "added" && !prev.hasOwnProperty(curData.version)) {
            prev[curData.version] = { ...curData, doc: change.doc };
          }
          if (docType === "modified" && prev.hasOwnProperty(curData.version)) {
            prev[curData.version] = { ...curData, doc: change.doc };
          }

          if (docType === "removed" && prev.hasOwnProperty(curData.id)) {
            delete prev[curData.version];
          }
          return prev;
        }, prev)
      );
    };
    const killSnapshot = getUserProposalsSnapshot(db, { nodeId: selectedNode, uname: username }, onSynchronize);
    return () => killSnapshot();
  }, [db, selectedNode]);

  useEffect(() => {
    if (!selectedNode) return;
    const onSynchronize = (changes: any) => {
      setProposals((prev: any) =>
        changes.reduce(
          (prev: (any & { id: string })[], change: any) => {
            const docType = change.type;
            const curData = {
              ...change.data,
              // createdAt: change.data.createdAt.toDate(),
              award: false,
              correct: false,
              wrong: false,
              comments: [],
            } as any & { id: string };

            const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
            if (docType === "added" && prevIdx === -1) {
              prev.push({ ...curData, doc: change.doc });
            }
            if (docType === "modified" && prevIdx !== -1) {
              prev[prevIdx] = { ...curData, doc: change.doc };
            }

            if (docType === "removed" && prevIdx !== -1) {
              prev.splice(prevIdx);
            }
            prev.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
            return prev;
          },
          [...prev]
        )
      );
    };
    const killSnapshot = getProposalsSnapshot(db, { nodeId: selectedNode }, onSynchronize);
    return () => killSnapshot();
  }, [db, selectedNode]);

  const proposalsWithId = useMemo(() => {
    return proposals.map((cur: any) => ({ ...cur, newNodeId: newId(db) }));
  }, [db, proposals]);

  useEffect(() => {
    if (selectedNode && open && initialProposal) {
      const proposal = proposalsWithId.find(_proposal => _proposal.id === initialProposal);
      if (proposal) {
        clearInitialProposal();
        selectProposal({ preventDefault: () => {} }, proposal, proposal.newNodeId);
      }
    }
  }, [initialProposal, selectedNode, open, proposalsWithId, clearInitialProposal, selectProposal]);

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const contentSignalState = useMemo(() => {
    return { updated: true };
  }, [proposals, openProposal, initialProposal, value, type]);

  return (
    <SidebarWrapper
      id="sidebar-wrapper-proposals"
      title="Proposals"
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      anchor="left"
      contentSignalState={contentSignalState}
      sx={{
        boxShadow: "none",
      }}
      SidebarOptions={
        <Box
          sx={{
            marginTop: "15px",
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
              width: "100%",
            }}
          >
            <Tabs
              id="focused-tabs"
              value={value}
              onChange={handleSwitchTab}
              aria-label={"Proposal Tabs"}
              variant="fullWidth"
            >
              {["Pending", "Approved"].map((tabItem: string, idx: number) => (
                <Tab key={tabItem} label={tabItem} {...a11yProps(idx)} />
              ))}
            </Tabs>
          </Box>
        </Box>
      }
      SidebarContent={
        <Box sx={{ px: "10px", paddingTop: "10px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "right",
              py: "10px",
            }}
          >
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

          {/* {
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", padding: "20px" }}>
              <CircularProgress />
            </Box>
          } */}

          {!proposalsWithId.filter(cur => (value === 0 ? !cur.accepted : cur.accepted)).length && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "40%",
              }}
            >
              <NextImage src={theme === "Dark" ? NoProposalDarkIcon : NoProposalLightIcon} alt="Notification icon" />
              <Typography
                sx={{
                  fontSize: "20px",

                  fontWeight: "500",
                }}
              >
                There's no Pending Proposals
              </Typography>
            </Box>
          )}
          {value === 0 && (
            <Box
              component="ul"
              className="collection"
              sx={{ padding: "0px", margin: "0px", display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <ProposalsList
                proposals={
                  type === "all" ? proposalsWithId : proposalsWithId.filter(proposal => proposal.nodeType === type)
                }
                setProposals={setProposals}
                proposeNodeImprovement={proposeNodeImprovement}
                rateProposal={rateProposal}
                selectProposal={selectProposal}
                deleteProposal={deleteProposal}
                editHistory={false}
                ratingProposal={ratingProposal}
                proposeNewChild={proposeNewChild}
                openProposal={openProposal}
                username={username}
                userVotesOnProposals={userVotesOnProposals}
                setUserVotesOnProposals={setUserVotesOnProposals}
              />
            </Box>
          )}
          {value === 1 && (
            <Box
              component="ul"
              className="collection"
              sx={{ padding: "0px", margin: "0px", display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <ProposalsList
                proposals={
                  type === "all" ? proposalsWithId : proposalsWithId.filter(proposal => proposal.nodeType === type)
                }
                setProposals={setProposals}
                proposeNodeImprovement={proposeNodeImprovement}
                rateProposal={rateProposal}
                ratingProposal={ratingProposal}
                selectProposal={selectProposal}
                deleteProposal={deleteProposal}
                editHistory={true}
                proposeNewChild={proposeNewChild}
                openProposal={openProposal}
                username={username}
                userVotesOnProposals={userVotesOnProposals}
                setUserVotesOnProposals={setUserVotesOnProposals}
              />
            </Box>
          )}
        </Box>
      }
    />
  );
};

export const MemoizedProposalsSidebar = React.memo(ProposalsSidebar);
