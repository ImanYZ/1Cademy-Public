import { MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { getDocs, getFirestore, limit, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";
import { NodeType } from "src/types";

import { getTypedCollections } from "@/lib/utils/getTypedCollections";

import PendingProposalList from "../PendingProposalList";
import { SidebarWrapper } from "./SidebarWrapper";

type PendingProposalSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  tagId: string | undefined;
  sidebarWidth: number;
  innerHeight?: number;
  // innerWidth: number;
};
const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const PendingProposalSidebar = ({
  open,
  onClose,
  openLinkedNode,
  username,
  tagId,
  sidebarWidth,
  innerHeight,
}: // innerWidth,
PendingProposalSidebarProps) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [type, setType] = useState<string>("all");
  const db = getFirestore();

  useEffect(() => {
    if (!username) return;
    if (!tagId) return;
    const versionsSnapshots: any[] = [];
    const versions: { [key: string]: any } = {};
    for (let nodeType of NODE_TYPES_ARRAY) {
      const { versionsColl, userVersionsColl } = getTypedCollections(db, nodeType);
      if (!versionsColl || !userVersionsColl) continue;

      const versionsQuery = query(
        versionsColl,
        where("accepted", "==", false),
        where("tagIds", "array-contains", tagId),
        where("deleted", "==", false)
      );

      const versionsSnapshot = onSnapshot(versionsQuery, async snapshot => {
        const docChanges = snapshot.docChanges();
        if (docChanges.length > 0) {
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
                where("user", "==", username),
                limit(1)
              );

              const userVersionsDocs = await getDocs(q);

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
            if (versions[versionId]) {
              versions[versionId]["nodeType"] = nodeType;
            }
          }

          const pendingProposals = { ...versions };
          const proposalsTemp = Object.values(pendingProposals);
          const orderredProposals = proposalsTemp.sort(
            (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
          );
          setProposals(orderredProposals);
        }
      });
      versionsSnapshots.push(versionsSnapshot);
    }

    return () => {
      for (let vSnapshot of versionsSnapshots) {
        vSnapshot();
      }
    };
  }, [db, username, tagId]);

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [type, proposals]);

  return (
    <SidebarWrapper
      id="sidebar-wrapper-pending-list"
      title="Pending Proposals"
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      // height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      contentSignalState={contentSignalState}
      sx={{
        boxShadow: "none",
      }}
      SidebarContent={
        <Box sx={{ p: "10px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "right",
              marginTop: "15px",
              py: "10px",
            }}
          >
            <Typography>Show</Typography>
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
              {FILTER_NODE_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <PendingProposalList
            proposals={type === "all" ? proposals : proposals.filter(proposal => proposal.nodeType === type)}
            openLinkedNode={openLinkedNode}
          />
        </Box>
      }
    />
  );
};

type FilterNodeType = { label: string; value: string }[];
const FILTER_NODE_TYPES: FilterNodeType = [
  { label: "All", value: "all" },
  { label: "Concept", value: "Concepts" },
  { label: "Relation", value: "Relations" },
  { label: "Question", value: "Questions" },
  { label: "Idea", value: "Ideas" },
  { label: "Reference", value: "Codes" },
  { label: "Code", value: "References" },
];

export const MemoizedPendingProposalSidebar = React.memo(PendingProposalSidebar);
