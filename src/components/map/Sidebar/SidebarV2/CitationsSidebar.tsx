import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Box, Divider, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { NodeFireStore } from "src/nodeBookTypes";
import { NodeType } from "src/types";

import NodeTypeIcon from "@/components/NodeTypeIcon";
import shortenNumber from "@/lib/utils/shortenNumber";

import { SidebarWrapper } from "./SidebarWrapper";
dayjs.extend(relativeTime);

type CitationSidebarProps = {
  open: boolean;
  onClose: () => void;
  openLinkedNode: any;
  identifier: string;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
};

type Citation = {
  id: string;
  title: string;
  nodeType: NodeType;
  corrects: number;
  wrongs: number;
  changedAt: any;
};
export const CitationsSidebar = ({
  identifier,
  openLinkedNode,
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  innerWidth,
}: CitationSidebarProps) => {
  const db = getFirestore();
  const [citationList, setCitationList] = useState<Citation[]>([]);

  useEffect(() => {
    const getCitations = async () => {
      const nodesCollection = collection(db, "nodes");
      const q = query(nodesCollection, where("referenceIds", "array-contains", identifier));
      const queryDocuments = await getDocs(q);
      const citations: Citation[] = queryDocuments.docs.map(cur => {
        const data: NodeFireStore = cur.data() as NodeFireStore;
        const citation: Citation = {
          id: cur.id,
          nodeType: data.nodeType,
          title: data.title,
          corrects: data.corrects,
          wrongs: data.wrongs,
          changedAt: data.changedAt,
        };
        return citation;
      });
      setCitationList(citations);
    };
    getCitations();
  }, [db, identifier]);

  const openLinkedNodeClick = useCallback(
    (nodeId: string) => {
      openLinkedNode(nodeId, "CitationSidebar");
    },
    [openLinkedNode]
  );

  return (
    <SidebarWrapper
      title="Citing Nodes"
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      sx={{
        boxShadow: "none",
      }}
      // anchor="right"
      contentSignalState={citationList}
      SidebarContent={
        <Box
          component={"ul"}
          sx={{ px: "16px", display: "flex", flexDirection: "column", gap: "4px", marginTop: "30px" }}
        >
          {citationList.map(cur => (
            <Paper
              component={"li"}
              elevation={3}
              className="CollapsedProposal collection-item"
              key={`node${cur.id}`}
              onClick={() => openLinkedNodeClick(cur.id)}
              sx={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 16px 10px 16px",
                borderRadius: "8px",
                boxShadow: theme =>
                  theme.palette.mode === "light"
                    ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                    : "none",
                background: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
                cursor: "pointer",
                ":hover": {
                  background: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
                },
              }}
            >
              {/* <NodeTypeIcon nodeType={cur.nodeType} sx={{ fontSize: "16px" }} />
              <MarkdownRender text={cur.title} /> */}
              <Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: "500",
                      lineHeight: "24px",
                    }}
                  >
                    {cur.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG500
                            : theme.palette.common.gray200,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <NodeTypeIcon nodeType={cur.nodeType || ""} fontSize="inherit" />
                    </Box>
                    <Box
                      sx={{
                        fontSize: "12px",
                        marginLeft: "5px",
                        color: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG200
                            : theme.palette.common.gray500,
                      }}
                    >
                      {dayjs(new Date(cur.changedAt)).fromNow()}
                    </Box>
                  </Box>
                  <Box
                    className="tab-double-button-node-footer"
                    sx={{
                      background: (theme: any) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG500
                          : theme.palette.common.gray200,
                      display: "flex",
                      alignItems: "center",
                      marginRight: "0px",
                      cursor: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        padding: "2px 10px 2px 10px",
                        borderRadius: "52px 0px 0px 52px",
                      }}
                    >
                      <Tooltip title={"Correct votes"} placement={"top"}>
                        <Box
                          sx={{
                            display: "flex",
                            fontSize: "14px",
                            alignItems: "center",
                          }}
                        >
                          <DoneIcon sx={{ fontSize: "18px", color: "inherit" }} />
                          <span>{shortenNumber(cur.corrects, 2, false)}</span>
                        </Box>
                      </Tooltip>
                    </Box>
                    <Divider
                      orientation="vertical"
                      variant="middle"
                      flexItem
                      sx={{
                        background: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                      }}
                    />
                    <Box
                      sx={{
                        padding: "2px 10px 2px 10px",
                        borderRadius: "0px 52px 52px 0px",
                      }}
                    >
                      <Tooltip title={"Wrong votes"} placement={"top"}>
                        <Box
                          sx={{
                            display: "flex",
                            fontSize: "14px",
                            alignItems: "center",
                          }}
                        >
                          <CloseIcon
                            sx={{
                              fontSize: "18px",
                              color: "inherit",
                            }}
                          />
                          <span>{shortenNumber(cur.wrongs, 2, false)}</span>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      }
    />
  );
};
