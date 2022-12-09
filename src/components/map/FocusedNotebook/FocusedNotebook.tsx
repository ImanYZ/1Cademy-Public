import CloseIcon from "@mui/icons-material/Close";
import { Box, Grid } from "@mui/material";
import { collection, Firestore, getDocs, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EdgesData, FullNodesData } from "src/nodeBookTypes";
import { INode } from "src/types/INode";
import { INodeLink } from "src/types/INodeLink";

import NodeItemContributors from "../../NodeItemContributors";
import { NodeItemFull } from "../../NodeItemFull";
import { MemoizedFocusedLinkedNodes } from "./FocusedLinkedNodes";
import FocusedNodeSkeleton from "./FocusedNodeSkeleton";
import { MemoizedFocusedReferencesList } from "./FocusedReferencesList";
import { MemoizedFocusedTagsList } from "./FocusedTagsList";

type FocusedNotebookProps = {
  db: Firestore;
  setFocusView: (state: { selectedNode: string; isEnabled: boolean }) => void;
  openLinkedNode: (linkedNodeID: string, typeOperation?: string) => void;
  graph: {
    nodes: FullNodesData;
    edges: EdgesData;
  };
  focusedNode: string;
};

const FocusedNotebook = ({ openLinkedNode, graph, focusedNode, setFocusView, db }: FocusedNotebookProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [institutionLogos, setInstitutionLogos] = useState<{
    [institutionName: string]: string;
  }>({});

  useEffect(() => {
    setSelectedNodeId(focusedNode);
  }, [focusedNode]);

  const fetchInstitution = useCallback(
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

  const currentNode = useMemo(() => {
    return (graph && graph.nodes[selectedNodeId]) || {};
  }, [graph, selectedNodeId]);

  const { parents, contributors, institutions, children } = currentNode || {};

  const navigateToNode = useCallback(
    (nodeId: string) => {
      if (!graph.nodes[nodeId]) {
        openLinkedNode(nodeId);
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
      if (institutionLogos.hasOwnProperty(name)) {
        fetchInstitution(name).then(institution => {
          setInstitutionLogos({
            ...institutionLogos,
            [name]: institution.logoURL,
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
          backgroundColor: "rgba(31,31,31, 0.8)",
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 1399,
          padding: "50px 40px",
          overflow: "auto",
        }}
      >
        <CloseIcon
          sx={{ position: "absolute", top: "20px", right: "20px", zIndex: "99" }}
          onClick={() => setFocusView({ isEnabled: false, selectedNode: "" })}
        />
        {currentNode.title ? (
          <Grid container spacing={3}>
            <Grid item sm={12} md={3}>
              {parents && parents?.length > 0 && (
                <MemoizedFocusedLinkedNodes
                  navigateToNode={navigateToNode}
                  nodeLinks={(parents as INodeLink[]) || []}
                  header="Learn Before"
                />
              )}
            </Grid>
            <Grid item sm={12} md={6}>
              <NodeItemFull
                node={currentNode as any}
                contributors={
                  <NodeItemContributors
                    contributors={(_contributors as any) || []}
                    institutions={(_institutions as any) || []}
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
                  <MemoizedFocusedTagsList navigateToNode={navigateToNode} node={currentNode as INode} sx={{ mt: 3 }} />
                }
                editable={false}
              />
            </Grid>
            <Grid item sm={12} md={3}>
              {children && children?.length > 0 && (
                <MemoizedFocusedLinkedNodes
                  navigateToNode={navigateToNode}
                  nodeLinks={(children as INodeLink[]) || []}
                  header="Learn After"
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
