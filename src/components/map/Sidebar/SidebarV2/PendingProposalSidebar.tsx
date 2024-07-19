import { MenuItem, Select, Skeleton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { getUserProposalsSnapshot } from "src/client/firestore/userProposals.firestore";
import { UserTheme } from "src/knowledgeTypes";

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
  pendingProposals: any;
  openComments: (refId: string, type: string, proposal?: any) => void;
  commentNotifications: any;
  // innerWidth: number;
};
// const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const PendingProposalSidebar = ({
  open,
  onClose,
  openLinkedNode,
  username,
  pendingProposals,
  sidebarWidth,
  innerHeight,
  openComments,
  commentNotifications,
}: // innerWidth,
PendingProposalSidebarProps) => {
  const [userVotesOnProposals, setUserVotesOnProposals] = useState({});
  // const [loadingProposals, setLoadingProposals] = useState(true);

  const [type, setType] = useState<string>("all");
  const db = getFirestore();

  useEffect(() => {
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
    const killSnapshot = getUserProposalsSnapshot(db, { nodeId: "", uname: username }, onSynchronize);
    return () => killSnapshot();
  }, [db]);

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [commentNotifications, type, pendingProposals]);
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
        <Box>
          <Box
            sx={{
              position: "sticky",
              backgroundColor: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : "#F9FAFB"),
              top: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "right",
              py: "10px",
              zIndex: "5",
              mr: "5px",
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
          {false ? (
            <Box>
              {Array.from(new Array(7)).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",

                    px: 2,
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={500}
                    height={250}
                    sx={{
                      bgcolor: "grey.300",
                      borderRadius: "10px",
                      mt: "19px",
                      ml: "5px",
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: "10px" }}>
              <PendingProposalList
                proposals={
                  type === "all"
                    ? pendingProposals
                    : pendingProposals.filter((proposal: any) => proposal.nodeType === type)
                }
                openLinkedNode={openLinkedNode}
                userVotesOnProposals={userVotesOnProposals}
                openComments={openComments}
                commentNotifications={commentNotifications}
              />
            </Box>
          )}
        </Box>
      }
    />
  );
};

type FilterNodeType = { label: string; value: string }[];
const FILTER_NODE_TYPES: FilterNodeType = [
  { value: "all", label: "All" },
  { value: "Concept", label: "Concepts" },
  { value: "Relation", label: "Relations" },
  { value: "Question", label: "Questions" },
  { value: "Idea", label: "Ideas" },
  { value: "Reference", label: "Codes" },
  { value: "Code", label: "References" },
];

export const MemoizedPendingProposalSidebar = React.memo(PendingProposalSidebar);
