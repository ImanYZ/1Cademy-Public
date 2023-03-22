import CloseIcon from "@mui/icons-material/Close";
import { Box, Grid, Tooltip } from "@mui/material";
import { collection, doc, Firestore, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EdgesData, FullNodesData } from "src/nodeBookTypes";
import { INode } from "src/types/INode";
import { INodeLink } from "src/types/INodeLink";

import { FocusedNodeItemFull } from "../../NodeItemFull";
import { MemoizedFocusedLinkedNodes } from "./FocusedLinkedNodes";
import { MemoizedFocusedNodeContributors } from "./FocusedNodeContributors";
import FocusedNodeSkeleton from "./FocusedNodeSkeleton";
import { MemoizedFocusedReferencesList } from "./FocusedReferencesList";
import { MemoizedFocusedRelatedNodes } from "./FocusedRelatedNodes";
import { MemoizedFocusedTagsList } from "./FocusedTagsList";

type FocusedNotebookProps = {
  db: Firestore;
  setFocusView: (state: { selectedNode: string; isEnabled: boolean }) => void;
  openLinkedNode: (linkedNodeID: string, typeOperation?: string) => void;
  setSelectedNode: (nodeId: string) => void;
  graph: {
    nodes: FullNodesData;
    edges: EdgesData;
  };
  focusedNode: string;
};

const FocusedNotebook = ({
  openLinkedNode,
  setSelectedNode,
  graph,
  focusedNode,
  setFocusView,
  db,
}: FocusedNotebookProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [institutionLogos, setInstitutionLogos] = useState<{
    [institutionName: string]: string;
  }>({});

  useEffect(() => {
    setSelectedNodeId(focusedNode);
  }, [focusedNode]);

  const fetchInstitutionLogo = useCallback(
    async (institutionName: string) => {
      const institutionsQuery = query(collection(db, "institutions"), where("name", "==", institutionName));

      const institutionsDocs = await getDocs(institutionsQuery);

      for (let institutionDoc of institutionsDocs.docs) {
        const institutionData = institutionDoc.data();
        return institutionData.logoURL;
      }
    },
    [db]
  );

  const loadNodeData = useCallback(
    async (nodeId: string) => {
      const nodeRef = doc(db, "nodes", nodeId);
      const nodeDoc = await getDoc(nodeRef);
      return nodeDoc.data();
    },
    [db]
  );

  const currentNode = useMemo(() => {
    return (graph && graph.nodes[selectedNodeId]) || {};
  }, [graph, selectedNodeId]);

  const { parents, contributors, institutions, children } = currentNode || {};

  const navigateToNode = useCallback(
    (nodeId: string) => {
      if (!graph.nodes[nodeId]) {
        openLinkedNode(nodeId);
      } else {
        setSelectedNode(nodeId);
      }
      setSelectedNodeId(nodeId);
    },
    [setSelectedNodeId, graph]
  );

  const _contributors = useMemo(() => {
    return Object.keys(contributors || {}).map((uname: string) => ({
      uname,
      ...contributors[uname],
    }));
  }, [contributors]);

  const _institutions = useMemo(() => {
    return Object.keys(institutions || {}).map((name: string) => {
      if (!institutionLogos.hasOwnProperty(name)) {
        fetchInstitutionLogo(name).then(logoUrl => {
          setInstitutionLogos({
            ...institutionLogos,
            [name]: logoUrl,
          });
        });
      }
      return {
        name,
        ...institutions[name],
        logoURL: institutionLogos[name],
      };
    });
  }, [institutions, institutionLogos]);

  return (
    <>
      <Box
        sx={{
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? "rgba(31,31,31, 1)" : theme.palette.common.lightBackground1,
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 1399,
          padding: "50px 10px",
          overflow: "auto",
        }}
      >
        <Tooltip title={"hide expand view"} placement="bottom">
          <CloseIcon
            sx={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: "99",
              color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : "rgba(31,31,31, 1)"),
            }}
            onClick={() => setFocusView({ isEnabled: false, selectedNode: "" })}
          />
        </Tooltip>
        {currentNode.title ? (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={3}>
              {parents && parents?.length > 0 && (
                <MemoizedFocusedLinkedNodes
                  loadNodeData={loadNodeData}
                  nodes={graph.nodes}
                  navigateToNode={navigateToNode}
                  nodeLinks={(parents as INodeLink[]) || []}
                  header="Learn Before"
                  width={window.innerWidth}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <FocusedNodeItemFull
                nodeId={selectedNodeId}
                node={currentNode as any}
                contributors={
                  <MemoizedFocusedNodeContributors
                    contributors={_contributors || []}
                    institutions={_institutions || []}
                  />
                }
                references={
                  <MemoizedFocusedReferencesList
                    navigateToNode={navigateToNode}
                    node={currentNode as INode}
                    sx={{ mt: 3 }}
                  />
                }
                tags={
                  <MemoizedFocusedTagsList
                    loadNodeData={loadNodeData}
                    nodes={graph.nodes}
                    navigateToNode={navigateToNode}
                    node={currentNode as INode}
                    sx={{ mt: 3 }}
                  />
                }
                relatedNodes={
                  <MemoizedFocusedRelatedNodes
                    currentNode={currentNode as INode}
                    node={currentNode.parents[0] ? (graph.nodes[currentNode.parents[0].node] as INode) : null}
                    navigateToNode={navigateToNode}
                  />
                }
                editable={false}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              {children && children?.length > 0 && (
                <MemoizedFocusedLinkedNodes
                  loadNodeData={loadNodeData}
                  nodes={graph.nodes}
                  navigateToNode={navigateToNode}
                  nodeLinks={(children as INodeLink[]) || []}
                  header="Learn After"
                  width={window.innerWidth}
                />
              )}
            </Grid>
          </Grid>
        ) : (
          <FocusedNodeSkeleton />
        )}
      </Box>
    </>
  );
};

export const MemoizedFocusedNotebook = React.memo(FocusedNotebook);
