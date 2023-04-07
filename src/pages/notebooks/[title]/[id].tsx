import CloseIcon from "@mui/icons-material/Close";
import { Modal, Paper, ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import { getAuth } from "firebase/auth";
import { collection, DocumentData, getFirestore, onSnapshot, Query, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps, NextPage } from "next/types";
import { ParsedUrlQuery } from "querystring";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
/* eslint-disable */
// @ts-ignore
import { MapInteractionCSS } from "react-map-interaction";

/* eslint-enable */
import NodeItemFullSkeleton from "@/components/NodeItemFullSkeleton";

import { MemoizedLinksList } from "../../../components/map/LinksList";
import { getNotebookById } from "../../../lib/firestoreServer/notebooks";
import { brandingLightTheme } from "../../../lib/theme/brandingTheme";
import { dagreUtils } from "../../../lib/utils/dagre.util";
import { devLog } from "../../../lib/utils/develop.util";
import { COLUMN_GAP, NODE_WIDTH } from "../../../lib/utils/Map.utils";
import { buildFullNodes, fillDagre, getNodes, getUserNodeChanges } from "../../../lib/utils/nodesSyncronization.utils";
import { TNodeUpdates } from "../../../nodeBookTypes";
import { Notebook } from "../../../types";
import { Graph } from "../../notebook";

type Props = {
  notebook: Notebook;
  //   updatedStr: string;
  //   createdStr: string;
};

interface Params extends ParsedUrlQuery {
  id: string;
  title: string;
}

export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
  const notebookId = params?.id;
  if (!notebookId) return { notFound: true };

  const notebook = await getNotebookById(notebookId || "");
  if (!notebook) return { notFound: true };

  //   const updatedStr = notebook.changedAt ? dayjs(new Date(notebook.changedAt)).format("YYYY-MM-DD") : "";
  //   const createdStr = notebook.createdAt ? dayjs(new Date(notebook.createdAt)).format("YYYY-MM-DD") : "";

  return {
    props: {
      notebook,
      //   updatedStr,
      //   createdStr,
    },
    revalidate: 20,
  };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const paths = [{ params: { id: "", title: "" } }];
  if (process.env.NODE_ENV === "production") {
    return { paths: [], fallback: "blocking" };
  }

  return { paths, fallback: "blocking" };
};

const NodePage: NextPage<Props> = ({ notebook }) => {
  const db = getFirestore();
  const router = useRouter();
  // flag for when scrollToNode is called
  const scrollToNodeInitialized = useRef(false);

  // scale and translation of the viewport over the map for the map interactions module
  const [mapInteractionValue, setMapInteractionValue] = useState({
    scale: 1,
    translation: { x: 0, y: 0 },
  });

  const [mapHovered, setMapHovered] = useState(false);
  //   const [openSearch, setOpenSearch] = useState(false);
  //   const isMobile = useMediaQuery("(max-width:600px)");

  // flag for whether media is full-screen
  const [openMedia, setOpenMedia] = useState<string | boolean>(false);

  const [graph, setGraph] = useState<Graph>({ nodes: {}, edges: {} });

  const g = useRef(dagreUtils.createGraph());

  const edgeIds = Object.keys(graph.edges);

  const [, /* nodeUpdates */ setNodeUpdates] = useState<TNodeUpdates>({
    nodeIds: [],
    updatedAt: new Date(),
  });

  //   ------------------------------ functions

  const onMouseClick = useCallback((e: any) => {
    if (e.button !== 1) return; // is not mouse well

    e.preventDefault();
  }, []);

  const mapContentMouseOver = useCallback((event: any) => {
    if (event.target?.parentNode?.parentNode?.getAttribute("id") !== "MapContent") {
      setMapHovered(true);
    } else {
      setMapHovered(false);
    }
  }, []);

  const navigateWhenNotScrolling = (newMapInteractionValue: any) => {
    if (!scrollToNodeInitialized.current) {
      return setMapInteractionValue(newMapInteractionValue);
    }
  };

  const userNodesSnapshot = useCallback(
    (q: Query<DocumentData>) => {
      const userNodesSnapshot = onSnapshot(
        q,
        async snapshot => {
          const docChanges = snapshot.docChanges();

          devLog("1:userNodes Snapshot:changes", docChanges);
          if (!docChanges.length) {
            // setIsSubmitting(false);
            // setFirstLoading(false);
            // setNoNodesFoundMessage(true);

            return null;
          }

          //   setNoNodesFoundMessage(false);
          const userNodeChanges = getUserNodeChanges(docChanges);
          devLog("2:Snapshot:Nodes Data", userNodeChanges);

          const nodeIds = userNodeChanges.map(cur => cur.uNodeData.node);
          const nodesData = await getNodes(db, nodeIds);
          devLog("3:Snapshot:Nodes Data", nodesData);

          const fullNodes = buildFullNodes(userNodeChanges, nodesData);
          devLog("4:Snapshot:Full nodes", fullNodes);

          // const visibleFullNodes = fullNodes.filter(cur => cur.visible || cur.nodeChangeType === "modified");

          //   setAllNodes(oldAllNodes => mergeAllNodes(fullNodes, oldAllNodes));

          setGraph(({ nodes, edges }) => {
            // const visibleFullNodesMerged = visibleFullNodes.map(cur => {
            const visibleFullNodesMerged = fullNodes.map(cur => {
              const tmpNode = nodes[cur.node];
              if (tmpNode) {
                if (tmpNode.hasOwnProperty("simulated")) {
                  delete tmpNode["simulated"];
                }
                if (tmpNode.hasOwnProperty("isNew")) {
                  delete tmpNode["isNew"];
                }
              }

              const hasParent = cur.parents.length;
              // IMPROVE: we need to pass the parent which open the node
              // to use his current position
              // in this case we are checking first parent
              // if this doesn't exist will set top:0 and left: 0 + NODE_WIDTH + COLUMN_GAP
              const nodeParent = hasParent ? nodes[cur.parents[0].node] : null;
              const topParent = nodeParent?.top ?? 0;

              const leftParent = nodeParent?.left ?? 0;
              const notebookIdx = (cur?.notebooks ?? []).findIndex(c => c === notebook.id);

              return {
                ...cur,
                left: tmpNode?.left ?? leftParent + NODE_WIDTH + COLUMN_GAP,
                top: tmpNode?.top ?? topParent,
                visible: Boolean((cur.notebooks ?? [])[notebookIdx]),
                open: Boolean((cur.expands ?? [])[notebookIdx]),
              };
            });

            devLog("5:user Nodes Snapshot:visible Full Nodes Merged", visibleFullNodesMerged);
            const updatedNodeIds: string[] = [];
            const { newNodes, newEdges } = fillDagre(
              g.current,
              visibleFullNodesMerged,
              nodes,
              edges,
              false,
              {}, // INFO: we are not sending tags, because we don't need cluster in public view
              updatedNodeIds
            );

            setNodeUpdates({
              nodeIds: updatedNodeIds,
              updatedAt: new Date(),
            });

            // if (!Object.keys(newNodes).length) {
            //   setNoNodesFoundMessage(true);
            // }
            return { nodes: newNodes, edges: newEdges };
          });
          devLog("user Nodes Snapshot", {
            userNodeChanges,
            nodeIds,
            nodesData,
            fullNodes,
            // visibleFullNodes,
          });
          //   setUserNodesLoaded(true);
        },
        error => console.error(error)
      );

      return () => userNodesSnapshot();
    },
    [db, notebook.id]
  );

  //   ------------------------------ useEffect

  useEffect(() => {
    const auth = getAuth();
    const userAuthObj = auth?.currentUser;
    console.log({ userAuthObj });
    // if (userAuthObj !== null && node?.title && node?.id) {
    //   router.push({
    //     pathname: ROUTES.notebook,
    //     query: { nodeId: node?.id },
    //   });
    //   return;
    // }
  }, []);

  useEffect(() => {
    if (!db) return;
    // if (!user) return;
    // if (!user.uname) return;
    // if (!allTagsLoaded) return;
    // if (!userTutorialLoaded) return;
    // if (!selectedNotebookId) return;

    devLog("SYNCHRONIZATION");

    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", notebook.owner),
      where("notebooks", "array-contains", notebook.id),
      where("deleted", "==", false)
    );

    const killSnapshot = userNodesSnapshot(q);
    return () => killSnapshot();
  }, [db, notebook.id, notebook.owner, userNodesSnapshot]);

  //   ------------------------------ Render

  if (router.isFallback) {
    return (
      <ThemeProvider theme={brandingLightTheme}>
        <NodeItemFullSkeleton />
      </ThemeProvider>
    );
  }

  // TODO: add Node head to SEO
  return (
    <div className="MapContainer" style={{ overflow: "hidden" }}>
      <Box
        id="Map"
        sx={{
          overflow: "hidden",
          position: "relative",
          background: theme =>
            theme.palette.mode === "dark"
              ? theme.palette.common.darkGrayBackground
              : theme.palette.common.lightGrayBackground,
        }}
      >
        <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
          {/* <MemoizedUserInfoSidebar
            theme={settings.theme}
            openLinkedNode={openLinkedNode}
            username={user.uname}
            open={openSidebar === "USER_INFO"}
            onClose={() => setOpenSidebar(null)}
          /> */}

          <Box
            id="MapContent"
            className={scrollToNodeInitialized.current ? "ScrollToNode" : undefined}
            onMouseOver={mapContentMouseOver}
            onTouchStart={mapContentMouseOver}
            onMouseUp={onMouseClick}
          >
            <MapInteractionCSS
              textIsHovered={mapHovered}
              value={mapInteractionValue}
              onChange={navigateWhenNotScrolling}
            >
              <MemoizedLinksList edgeIds={edgeIds} edges={graph.edges} />
              {/* <MemoizedNodeList
                nodeUpdates={nodeUpdates}
                notebookRef={notebookRef}
                setNodeUpdates={setNodeUpdates}
                setFocusView={setFocusView}
                nodes={graph.nodes}
                bookmark={bookmark}
                markStudied={markStudied}
                chosenNodeChanged={chosenNodeChanged}
                referenceLabelChange={referenceLabelChange}
                deleteLink={deleteLink}
                cleanEditorLink={cleanEditorLink}
                openLinkedNode={openLinkedNode}
                openAllChildren={openAllChildren}
                openAllParent={openAllParent}
                hideNodeHandler={hideNodeHandler}
                hideDescendants={hideDescendants}
                toggleNode={toggleNode}
                openNodePart={openNodePart}
                onNodeShare={onNodeShare}
                selectNode={selectNode}
                nodeClicked={nodeClicked} // CHECK when is used
                correctNode={correctNode}
                wrongNode={wrongNode}
                uploadNodeImage={uploadNodeImage}
                removeImage={removeImage}
                setOpenMedia={(imgUrl: string | boolean) => setOpenMedia(imgUrl)}}
                changeNodeHight={changeNodeHight}
                changeChoice={changeChoice}
                changeFeedback={changeFeedback}
                switchChoice={switchChoice}
                deleteChoice={deleteChoice}
                addChoice={addChoice}
                onNodeTitleBlur={onNodeTitleBlur}
                setOpenSearch={setOpenSearch}
                saveProposedChildNode={saveProposedChildNode}
                saveProposedImprovement={saveProposedImprovement}
                closeSideBar={closeSideBar}
                reloadPermanentGrpah={reloadPermanentGraph}
                setNodeParts={setNodeParts}
                citations={citations}
                setOpenSideBar={setOpenSidebar}
                proposeNodeImprovement={proposeNodeImprovement}
                proposeNewChild={proposeNewChild}
                scrollToNode={scrollToNode}
                openSidebar={openSidebar}
                setOperation={setOperation}
                openUserInfoSidebar={openUserInfoSidebar}
                disabledNodes={[]}
                enableChildElements={[]}
                // showProposeTutorial={!(userTutorial.proposal.done || userTutorial.proposal.skipped)}
                // setCurrentTutorial={setCurrentTutorial}
                ableToPropose={ableToPropose}
                setAbleToPropose={setAbleToPropose}
                setOpenPart={onChangeNodePart}
                // selectedNotebookId={selectedNotebookId}
              /> */}
            </MapInteractionCSS>

            <Suspense fallback={<div></div>}>
              <Modal
                open={Boolean(openMedia)}
                onClose={() => setOpenMedia(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <>
                  <CloseIcon
                    sx={{ position: "absolute", top: "60px", right: "50px", zIndex: "99" }}
                    onClick={() => setOpenMedia(false)}
                  />
                  <MapInteractionCSS>
                    {/* TODO: change open Media variable to string to not validate */}
                    {typeof openMedia === "string" && (
                      <Paper
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100vh",
                          width: "100vw",
                          background: "transparent",
                        }}
                      >
                        {/* TODO: change to Next Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={openMedia} alt="Node image" className="responsive-img" />
                      </Paper>
                    )}
                  </MapInteractionCSS>
                </>
              </Modal>
              {/* {(isSubmitting || (!queueFinished && firstLoading)) && (
                <div className="CenterredLoadingImageContainer">
                  <NextImage
                    className="CenterredLoadingImage"
                    loading="lazy"
                    src={LoadingImg}
                    alt="Loading"
                    width={250}
                    height={250}
                  />
                </div>
              )} */}
            </Suspense>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default NodePage;
