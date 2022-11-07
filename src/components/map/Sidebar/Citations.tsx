// import { citations } from "../../MapUtils";
// import "./Citations.css";

import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { NodeFireStore } from "../../../nodeBookTypes";
import { NodeType } from "../../../types";
// import { Editor } from "../../Editor";
import MarkdownRender from "../../Markdown/MarkdownRender";
import NodeTypeIcon from "../../NodeTypeIcon2";

// import React, { useCallback, useEffect, useState } from "react";
// import { useRecoilValue } from "recoil";

// import { allNodesState, selectedNodeState } from "../../../../store/MapAtoms";
// import HyperEditor from "../../../Editor/HyperEditor/HyperEditorWrapper";
// import NodeTypeIcon from "../../Node/NodeTypeIcon/NodeTypeIcon";

type Citation = {
  id: string;
  title: string;
  nodeType: NodeType;
};

type CitationsProps = {
  // citations: { [key: string]: Set<string> };
  openLinkedNode: any;
  // selectedNode: string;
  allNodes: any;
  identifier: string;
};

const Citations = ({ openLinkedNode, identifier }: CitationsProps) => {
  // const selectedNode = useRecoilValue(selectedNodeState);
  // const allNodes = useRecoilValue(allNodesState);
  const db = getFirestore();

  // const [citationList, setCitationList] = useState<string[]>([]);
  const [citationList, setCitationList] = useState<Citation[]>([]);

  // useEffect(() => {
  //   // ********************************************************
  //   // Retrieve all the nodes that are citing this from the nodes collection.
  //   // ********************************************************
  //   if (!nodeBookState.selectedNode) return;
  //   if (nodeBookState.selectedNode in citations) {
  //     // setCitationList([...citations[selectedNode]]);
  //     console.log("setCityationsList");
  //     setCitationList(Array.from(citations[nodeBookState.selectedNode]));
  //   }
  // }, [citations, nodeBookState.selectedNode]);

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
          {/* <div className="SidebarNodeTypeIcon"> */}
          {/* <NodeTypeIcon nodeType={allNodes[nodeId].nodeType} /> */}
          <NodeTypeIcon nodeType={cur.nodeType} sx={{ fontSize: "16px" }} />
          {/* </div> */}
          {/* <div className="SearchResultTitle"> */}
          {/* <HyperEditor readOnly={true} onChange={doNothing} content={allNodes[nodeId].title} /> */}
          <MarkdownRender text={cur.title} />
          {/* </div> */}
        </Paper>
      ))}
    </Box>
  );
};

export const MemoizedCitations = React.memo(Citations);
// export default React.memo(Citations);
