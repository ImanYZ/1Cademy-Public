// import { citations } from "../../MapUtils";
// import "./Citations.css";

import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useEffect, useState } from "react";

import { useNodeBook } from "../../../context/NodeBookContext";
// import { Editor } from "../../Editor";
import MarkdownRender from "../../Markdown/MarkdownRender";
import NodeTypeIcon from "../../NodeTypeIcon2";

// import React, { useCallback, useEffect, useState } from "react";
// import { useRecoilValue } from "recoil";

// import { allNodesState, selectedNodeState } from "../../../../store/MapAtoms";
// import HyperEditor from "../../../Editor/HyperEditor/HyperEditorWrapper";
// import NodeTypeIcon from "../../Node/NodeTypeIcon/NodeTypeIcon";

type CitationsProps = {
  citations: { [key: string]: Set<string> };
  openLinkedNode: any;
  // selectedNode: string;
  allNodes: any;
};

const Citations = ({ citations, openLinkedNode, allNodes }: CitationsProps) => {
  // const selectedNode = useRecoilValue(selectedNodeState);
  // const allNodes = useRecoilValue(allNodesState);

  const { nodeBookState } = useNodeBook();

  const [citationList, setCitationList] = useState<string[]>([]);

  useEffect(() => {
    // ********************************************************
    // Retrieve all the nodes that are citing this from the nodes collection.
    // ********************************************************
    if (!nodeBookState.selectedNode) return;
    if (nodeBookState.selectedNode in citations) {
      // setCitationList([...citations[selectedNode]]);
      console.log("setCityationsList");
      setCitationList(Array.from(citations[nodeBookState.selectedNode]));
    }
  }, [citations, nodeBookState.selectedNode]);

  const openLinkedNodeClick = useCallback(
    (nodeId: string) => {
      openLinkedNode(nodeId);
    },
    [openLinkedNode]
  );

  console.log("x", citationList);
  return (
    <Box component={"ul"} sx={{ px: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
      {Object.keys(allNodes).map(nodeId => {
        if (!citationList.includes(nodeId)) {
          return null;
        }
        return (
          <Paper
            component={"li"}
            elevation={3}
            className="CollapsedProposal collection-item"
            key={`node${nodeId}`}
            onClick={() => openLinkedNodeClick(nodeId)}
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
            <NodeTypeIcon nodeType={allNodes[nodeId].nodeType} sx={{ fontSize: "16px" }} />
            {/* </div> */}
            {/* <div className="SearchResultTitle"> */}
            {/* <HyperEditor readOnly={true} onChange={doNothing} content={allNodes[nodeId].title} /> */}
            <MarkdownRender text={allNodes[nodeId].title} />
            {/* </div> */}
          </Paper>
        );
      })}
    </Box>
  );
};

export const MemoizedCitations = React.memo(Citations);
// export default React.memo(Citations);
