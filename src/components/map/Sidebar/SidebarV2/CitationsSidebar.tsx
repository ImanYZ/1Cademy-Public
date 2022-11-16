import { Box, Paper } from "@mui/material";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { NodeFireStore } from "src/nodeBookTypes";
import { NodeType } from "src/types";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeTypeIcon from "@/components/NodeTypeIcon";

import citation from "../../../../../public/citations.jpg";
import { SidebarWrapper } from "./SidebarWrapper";

type CitationSidebarProps = {
  open: boolean;
  onClose: () => void;
  openLinkedNode: any;
  identifier: string;
};

type Citation = {
  id: string;
  title: string;
  nodeType: NodeType;
};
export const CitationsSidebar = ({ identifier, openLinkedNode, open, onClose }: CitationSidebarProps) => {
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
        };
        return citation;
      });
      setCitationList(citations);
    };
    getCitations();
  }, [db, identifier]);

  const openLinkedNodeClick = useCallback(
    (nodeId: string) => {
      openLinkedNode(nodeId);
    },
    [openLinkedNode]
  );

  return (
    <SidebarWrapper
      title="Citing Nodes"
      headerImage={citation}
      open={open}
      onClose={onClose}
      width={430}
      // anchor="right"
      contentSignalState={citationList}
      SidebarContent={
        <Box component={"ul"} sx={{ px: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {citationList.map(cur => (
            <Paper
              component={"li"}
              elevation={3}
              className="CollapsedProposal collection-item"
              key={`node${cur.id}`}
              onClick={() => openLinkedNodeClick(cur.id)}
              sx={{
                listStyle: "none",
                padding: "10px",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <NodeTypeIcon nodeType={cur.nodeType} sx={{ fontSize: "16px" }} />
              <MarkdownRender text={cur.title} />
            </Paper>
          ))}
        </Box>
      }
    />
  );
};
