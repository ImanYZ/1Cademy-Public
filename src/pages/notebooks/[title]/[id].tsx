import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Button, Divider, IconButton, Modal, Paper, ThemeProvider, Tooltip, Typography, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import { Stack } from "@mui/system";
import { collection, DocumentData, getFirestore, onSnapshot, Query, query, where } from "firebase/firestore";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps, NextPage } from "next/types";
import { ParsedUrlQuery } from "querystring";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
/* eslint-disable */
// @ts-ignore
import { MapInteractionCSS } from "react-map-interaction";

/* eslint-enable */
import NodeItemFullSkeleton from "@/components/NodeItemFullSkeleton";

import oneCademyLogo from "../../../../public/1Cademy-head.svg";
import focusViewLogo from "../../../../public/focus.svg";
import focusViewDarkLogo from "../../../../public/focus-dark.svg";
import { MemoizedBasicNode } from "../../../components/map/BasicNode";
import { MemoizedFocusedNotebook } from "../../../components/map/FocusedNotebook/FocusedNotebook";
import { MemoizedLinksList } from "../../../components/map/LinksList";
import { NotebookPopup } from "../../../components/map/Popup";
import { MemoizedUserInfoSidebar } from "../../../components/map/Sidebar/SidebarV2/UserInfoSidebar";
import { MemoizedToolbox } from "../../../components/map/Toolbox";
import { useAuth } from "../../../context/AuthContext";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useWorkerQueue } from "../../../hooks/useWorkerQueue";
import { getNotebookById } from "../../../lib/firestoreServer/notebooks";
import { brandingLightTheme } from "../../../lib/theme/brandingTheme";
import { dagreUtils } from "../../../lib/utils/dagre.util";
import { devLog } from "../../../lib/utils/develop.util";
import { COLUMN_GAP, copyNode, NODE_WIDTH } from "../../../lib/utils/Map.utils";
import { buildFullNodes, fillDagre, getNodes, getUserNodeChanges } from "../../../lib/utils/nodesSyncronization.utils";
import ROUTES from "../../../lib/utils/routes";
import { FullNodeData, FullNodesData, OpenPart, SelectedUser, TNodeUpdates } from "../../../nodeBookTypes";
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
  const theme = useTheme();
  const db = getFirestore();
  const router = useRouter();
  const [{ user }, { dispatch }] = useAuth();
  // flag for when scrollToNode is called
  const scrollToNodeInitialized = useRef(false);

  // scale and translation of the viewport over the map for the map interactions module
  const [mapInteractionValue, setMapInteractionValue] = useState({
    scale: 1,
    translation: { x: 0, y: 0 },
  });

  // as map grows, width and height grows based on the nodes shown on the map
  const [mapWidth, setMapWidth] = useState(700);
  const [mapHeight, setMapHeight] = useState(400);

  const [mapHovered, setMapHovered] = useState(false);
  //   const [openSearch, setOpenSearch] = useState(false);
  //   const isMobile = useMediaQuery("(max-width:600px)");

  // object of cluster boundaries
  const [, /* clusterNodes */ setClusterNodes] = useState({});

  // flag for whether media is full-screen
  const [openMedia, setOpenMedia] = useState<string | boolean>(false);

  const [graph, setGraph] = useState<Graph>({ nodes: {}, edges: {} });

  const g = useRef(dagreUtils.createGraph());

  const edgeIds = Object.keys(graph.edges);

  const [, /* nodeUpdates */ setNodeUpdates] = useState<TNodeUpdates>({
    nodeIds: [],
    updatedAt: new Date(),
  });

  const { addTask /* isQueueWorking, queueFinished */ } = useWorkerQueue({
    setNodeUpdates,
    g,
    graph,
    setGraph,
    setMapWidth,
    setMapHeight,
    mapWidth,
    mapHeight,
    allTags: {},
    onComplete: () => console.log("onComplete worker"),
    setClusterNodes,
    withClusters: false,
  });

  const { width: windowWith, height: windowHeight } = useWindowSize();

  const [openSidebar, setOpenSidebar] = useState<"USER_INFO" | null>(null);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [displayFocusMode, setDisplayFocusMode] = useState(false);
  const [displayJoinMessage, setDisplayJoinMessage] = useState(false);
  //   ------------------------------ functions

  const setNodeParts = useCallback((nodeId: string, innerFunc: (thisNode: FullNodeData) => FullNodeData) => {
    console.log("setNodeParts..");
    setGraph(({ nodes: oldNodes, edges }) => {
      // setSelectedNodeType(oldNodes[nodeId].nodeType);
      console.log("set graph");
      const thisNode = { ...oldNodes[nodeId] };
      const newNode = { ...oldNodes, [nodeId]: innerFunc(thisNode) };
      console.log({ thisNode, newNode });
      return { nodes: newNode, edges };
    });
    setNodeUpdates({
      nodeIds: [nodeId],
      updatedAt: new Date(),
    });
  }, []);

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

  /**
   * This function is called only when NODE HIGHT was changed
   */
  const changeNodeHight = useCallback(
    (nodeId: string, height: number) => {
      devLog("CHANGE 🚀", `H:${height.toFixed(1)}, nId:${nodeId}`);
      addTask({ id: nodeId, height });
    },
    [addTask]
  );

  const getColumnRows = useCallback((nodes: FullNodesData, column: number) => {
    let rows: string[] = [];
    for (const nodeId in nodes) {
      const node = nodes[nodeId];
      if (node.left === column) {
        rows.push(nodeId);
      }
    }
    rows.sort((n1, n2) => (nodes[n1]!.top < nodes[n2]!.top ? -1 : 1));
    return rows;
  }, []);

  const processHeightChange = useCallback(
    (nodeId: string) => {
      setTimeout(() => {
        setGraph(graph => {
          const updatedNodeIds: string[] = [];
          const nodes = { ...graph.nodes };
          const nodeEl = document.getElementById(nodeId)! as HTMLElement;
          let height: number = nodeEl.clientHeight;
          if (isNaN(height)) {
            height = nodes[nodeId]!.height ?? 0; //take a look with Ameer Hamza
          }

          let nodesUpdated = false;
          const nodeData = nodes[nodeId]!;
          const column = nodeData.left;
          const rows = getColumnRows(nodes, column);
          if (rows) {
            const nodeIdx = rows.indexOf(nodeId);
            const heightDiff = height - (nodes[nodeId]!.height ?? 0); //take a look with Ameer Hamza

            let lastHeight = height;
            let lastTop = nodes[nodeId]!.top;

            // below of bound
            for (let idx = nodeIdx + 1; idx < rows.length; idx++) {
              const _nodeId = rows[idx];
              const _nodeData = copyNode(nodes[_nodeId]);

              // if next node doesn't need to move on graph
              if (_nodeData.top > lastHeight + lastTop) {
                break;
              }

              _nodeData.top += heightDiff;

              lastHeight = _nodeData.height ?? 0; //take a look with Ameer Hamza
              lastTop = _nodeData.top;

              nodesUpdated = true;
              updatedNodeIds.push(_nodeId);
              nodes[_nodeId] = _nodeData;
            }
          }

          if (!nodesUpdated) {
            return graph;
          }

          setTimeout(() => {
            setNodeUpdates({
              nodeIds: updatedNodeIds,
              updatedAt: new Date(),
            });
          }, 100);
          return {
            nodes: { ...nodes },
            edges: graph.edges,
          };
        });
      }, 200);
    },
    [setGraph, getColumnRows]
  );

  const selectNode = useCallback((event: any, nodeId: string, chosenType: any, nodeType: any) => {
    devLog("SELECT_NODE", {
      // choosingNode: notebookRef.current.choosingNode,
      nodeId,
      chosenType,
      nodeType,
    });
    // if (notebookRef.current.choosingNode) return;

    // if (
    //   notebookRef.current.selectionType === "AcceptedProposals" ||
    //   notebookRef.current.selectionType === "Proposals"
    // ) {
    //   reloadPermanentGraph();
    // }

    // if (chosenType === "Proposals") {
    //   if (openSidebar === "PROPOSALS" && nodeId === notebookRef.current.selectedNode) {
    //     setOpenSidebar(null);
    //   } else {
    //     setOpenSidebar("PROPOSALS");
    //     setSelectedNodeType(nodeType);
    //     notebookRef.current.selectionType = chosenType;
    //     notebookRef.current.selectedNode = nodeId;
    //     nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
    //     nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
    //   }
    //   return;
    // }

    // if (chosenType === "Citations") {
    //   if (openSidebar === "CITATIONS") {
    //     setOpenSidebar(null);
    //     return;
    //   }
    //   setOpenSidebar("CITATIONS");
    //   setSelectedNodeType(nodeType);
    //   notebookRef.current.selectionType = chosenType;
    //   notebookRef.current.selectedNode = nodeId;
    //   nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
    //   nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
    //   return;
    // }

    // if (notebookRef.current.selectedNode === nodeId && notebookRef.current.selectionType === chosenType) {
    //   notebookRef.current.selectionType = null;
    //   nodeBookDispatch({ type: "setSelectionType", payload: null });
    //   setSelectedNodeType(null);
    //   setOpenPendingProposals(false);
    //   setOpenChat(false);
    //   setOpenNotifications(false);
    //   notebookRef.current.openToolbar = false;
    //   nodeBookDispatch({ type: "setOpenToolbar", payload: false });
    //   setOpenSearch(false);
    //   setOpenRecentNodes(false);
    //   setOpenTrends(false);
    //   setOpenMedia(false);
    //   resetAddedRemovedParentsChildren();
    //   setOpenSidebar(null);
    //   event.currentTarget.blur();
    // } else {
    //   setOpenSidebar("PROPOSALS");
    //   setSelectedNodeType(nodeType);
    //   notebookRef.current.selectionType = chosenType;
    //   notebookRef.current.selectedNode = nodeId;
    //   nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
    //   nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
    // }
  }, []);

  const onChangeNodePart = useCallback(
    (nodeId: string, newOpenPart: OpenPart) => {
      setNodeParts(nodeId, node => {
        return { ...node, localLinkingWords: newOpenPart };
      });
      processHeightChange(nodeId); // CHECK: check if is required, maybe we can remove it
    },
    [processHeightChange, setNodeParts]
  );

  const toggleNode = useCallback(
    (event: any, nodeId: string) => {
      setNodeParts(nodeId, node => {
        console.log("set node parts");
        const notebookIdx = node.notebooks.findIndex(cur => cur === notebook.id);
        if (notebookIdx < 0) return node;

        const newValue = !node.expands[notebookIdx];
        return { ...node, expands: node.expands.map((c, idx) => (idx === notebookIdx ? newValue : c)), open: newValue };
      });
    },
    [notebook.id, setNodeParts]
  );

  const onOpenUserInfoSidebar = (user: SelectedUser) => {
    setOpenSidebar("USER_INFO");
    setSelectedUser(user);
  };

  const scrollToNode = useCallback(
    (nodeId: string, tries = 0) => {
      if (scrollToNodeInitialized.current) return;

      if (tries === 10) return;

      setTimeout(() => {
        setGraph(graph => {
          const originalNode = document.getElementById(nodeId);
          const thisNode = graph.nodes[nodeId];
          if (!originalNode) return graph;
          if (!thisNode) return graph;

          if (
            originalNode &&
            "offsetLeft" in originalNode &&
            originalNode.offsetLeft !== 0 &&
            "offsetTop" in originalNode &&
            originalNode.offsetTop !== 0
          ) {
            scrollToNodeInitialized.current = true;
            setTimeout(() => {
              scrollToNodeInitialized.current = false;
            }, 1300);

            setMapInteractionValue(() => {
              const windowSize = window.innerWidth;
              let defaultScale;
              if (windowSize < 400) defaultScale = 0.45;
              else if (windowSize < 600) defaultScale = 0.575;
              else if (windowSize < 1260) defaultScale = 0.8;
              else defaultScale = 0.92;

              const windowInnerTop = windowWith < 899 ? (openSidebar ? 350 : 50) : 50;
              const windowInnerLeft = (windowWith * 10) / 100 + (windowWith > 899 ? (openSidebar ? 430 : 80) : 10);
              const windowInnerRight = (windowWith * 10) / 100;
              const windowInnerBottom = 50;
              const regionWidth = windowWith - windowInnerLeft - windowInnerRight;
              const regionHeight = windowHeight - windowInnerTop - windowInnerBottom;

              return {
                scale: defaultScale,
                translation: {
                  x: windowInnerLeft + regionWidth / 2 - (thisNode.left + originalNode.offsetWidth / 2) * defaultScale,
                  y: windowInnerTop + regionHeight / 2 - (thisNode.top + originalNode.offsetHeight / 2) * defaultScale,
                },
              };
            });
          } else {
            scrollToNode(nodeId, tries + 1);
          }
          return graph;
        });
      }, 400);
    },
    [openSidebar, windowHeight, windowWith]
  );

  //   ------------------------------ memos

  const nodeList = useMemo(() => {
    return Object.keys(graph.nodes)
      .map(nId => graph.nodes[nId])
      .map(cur => (
        <MemoizedBasicNode
          key={cur.node}
          changeNodeHight={changeNodeHight}
          choices={cur.choices}
          content={cur.content}
          identifier={cur.node}
          left={cur.left}
          nodeImage={cur.nodeImage ?? ""}
          nodeType={cur.nodeType}
          nodeVideo={cur.nodeVideo ?? ""}
          nodeVideoEndTime={cur.nodeVideoEndTime || 0}
          nodeVideoStartTime={cur.nodeVideoStartTime || 0}
          open={Boolean(cur.open)}
          setOpenMedia={setOpenMedia}
          title={cur.title}
          top={cur.top}
          width={NODE_WIDTH}
          // aImgUrl={cur. .aImgUrl ?? ""}
          admin={{
            username: cur.admin,
            imageUrl: cur.aImgUrl ?? "",
            fullName: cur.aFullname,
            chooseUname: cur.aChooseUname,
          }}
          bookmarked={cur.bookmarked}
          bookmarks={cur.bookmarks}
          changedAt={cur.changedAt}
          correctNum={cur.corrects}
          locked={Boolean(cur.locked)}
          // markedCorrect={cur.correct}
          // markedWrong={cur.wrong}
          nodesChildren={cur.children ?? []}
          // notebookRef={null}
          // onNodeShare={onNodeShare}
          // openNodePart={openNodePart}
          openPart={cur.localLinkingWords}
          parents={cur.parents ?? []}
          references={(cur.references ?? []).map((c: string, idx: number) => ({
            title: c,
            node: cur.referenceIds[idx],
            label: cur.referenceLabels[idx],
          }))}
          selectNode={selectNode}
          setOpenPart={onChangeNodePart}
          tags={(cur.tags ?? []).map((c: string, idx: number) => ({
            node: cur.tagIds[idx],
            title: c,
          }))}
          viewers={cur.viewers}
          wrongNum={cur.wrongs}
          toggleNode={toggleNode}
          openUserInfoSidebar={onOpenUserInfoSidebar}
          onSelecteNode={setSelectedNodeId}
          selectedNodeId={selectedNodeId}
          displayJoinMessage={() => {
            console.log("display join message");
            setDisplayJoinMessage(true);
          }}
        />
      ));
  }, [changeNodeHight, graph.nodes, onChangeNodePart, selectNode, selectedNodeId, toggleNode]);

  //   ------------------------------ useEffect

  useEffect(() => {
    // const userAuthObj = auth?.currentUser;
    if (user) {
      router.push(`${ROUTES.notebook}?nb=${notebook.id}`);
    }
    // console.log({ userAuthObj, query: router.query });
  }, [notebook.id, router, user]);

  useEffect(() => {
    if (!db) return;
    // if (!user) return;
    // if (!user.uname) return;
    // if (!allTagsLoaded) return;
    // if (!userTutorialLoaded) return;
    // if (!selectedNotebookId) return;

    devLog("SYNCHRONIZATION", { owner: notebook.owner, notebookId: notebook.id });

    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", notebook.owner),
      where("notebooks", "array-contains", notebook.id)
      // where("deleted", "==", false)
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
    <Box className="MapContainer" sx={{ position: "relative", overflow: "hidden" }}>
      <MemoizedToolbox
        sx={{
          position: "absolute",
          right: "364px",
          top: {
            xs: openSidebar ? `${innerHeight * 0.25 + 7}px!important` : "8px",
            sm: "8px",
          },
        }}
      >
        <>
          <Tooltip title="Change theme">
            <IconButton
              onClick={() => dispatch({ type: "setTheme", payload: theme.palette.mode === "dark" ? "Light" : "Dark" })}
              size="small"
            >
              {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" sx={{ height: "auto" }} />
          <Tooltip title="Scroll to last Selected Node" placement="bottom">
            <IconButton
              id="toolbox-scroll-to-node"
              color="secondary"
              onClick={() => scrollToNode(selectedNodeId)}
              disabled={!selectedNodeId ? true : false}
              sx={{
                opacity: !selectedNodeId ? 0.5 : undefined,
                padding: { xs: "2px", sm: "8px" },
              }}
            >
              <MyLocationIcon sx={{ color: theme => (theme.palette.mode === "dark" ? "#CACACA" : "#667085") }} />
            </IconButton>
          </Tooltip>
          <Tooltip
            title="Focused view for selected node"
            placement="bottom"
            sx={{
              ":hover": {
                background: theme.palette.mode === "dark" ? "#404040" : "#EAECF0",
                borderRadius: "8px",
              },
              padding: { xs: "2px", sm: "8px" },
            }}
          >
            <IconButton
              id="toolbox-focus-mode"
              color="secondary"
              onClick={() => {
                setDisplayFocusMode(true);
                // setFocusView({ isEnabled: true, selectedNode: selectedNodeId });
                // setOpenProgressBar(false);
              }}
              disabled={!selectedNodeId}
              sx={{ opacity: !selectedNodeId ? 0.5 : undefined }}
            >
              <NextImage
                src={theme.palette.mode === "light" ? focusViewLogo : focusViewDarkLogo}
                alt="logo 1cademy"
                width="24px"
                height="24px"
              />
            </IconButton>
          </Tooltip>
        </>
      </MemoizedToolbox>

      {displayFocusMode && (
        <MemoizedFocusedNotebook
          setSelectedNode={() => {}}
          db={db}
          graph={graph}
          onCloseFocusMode={() => setDisplayFocusMode(false)}
          focusedNode={selectedNodeId}
          openLinkedNode={() => {}}
          navigationBlocked={true}
          onClickOnNavigationBlocked={() => setDisplayJoinMessage(true)}
        />
      )}

      <Stack
        direction={"row"}
        spacing={"16px"}
        alignItems={"center"}
        sx={{
          p: "12px 16px",
          position: "absolute",
          right: "8px",
          top: "8px",
          zIndex: 100,
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
        }}
      >
        <Tooltip title={notebook.title}>
          <Typography sx={{ width: "138px", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
            {notebook.title}
          </Typography>
        </Tooltip>
        <Stack direction={"row"} spacing={"8px"}>
          <Button
            variant="outlined"
            sx={{ borderRadius: "26px", borderColor: theme => theme.palette.common.primary800 }}
            onClick={() => router.push({ pathname: ROUTES.signUp, query: { from: router.asPath } })}
          >
            Sign in
          </Button>
          <Button
            variant="contained"
            sx={{ borderRadius: "26px", background: theme => theme.palette.common.primary800 }}
            onClick={() => router.push({ pathname: ROUTES.signIn, query: { from: router.asPath } })}
          >
            Sign Up
          </Button>
        </Stack>
      </Stack>

      <Modal open={displayJoinMessage} onClose={() => setDisplayJoinMessage(false)}>
        <Box
          sx={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "100%",
            zIndex: 1400,
          }}
        >
          <Stack
            alignItems={"center"}
            sx={{
              position: "relative",
              p: "40px 87px",
              maxWidth: "538px",
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.gray50,
            }}
          >
            <IconButton
              onClick={() => setDisplayJoinMessage(false)}
              size={"small"}
              sx={{ position: "absolute", top: "36px", right: "36px", p: "0px" }}
            >
              <CloseIcon />
            </IconButton>

            <NextImage src={oneCademyLogo.src} alt="logo" width={"70px"} height={"70px"} />

            <Typography
              sx={{
                fontSize: "16px",
                textAlign: "center",
                fontWeight: 500,
                mb: "8px",
                mt: "20px",
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.gray25 : theme.palette.common.gray900,
              }}
            >
              Unlock the power of our platform and join now!
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                textAlign: "center",
                mb: "32px",
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG100 : theme.palette.common.gray500,
              }}
            >
              Sign up and get access to all features. Discover our large community to enhance the standards of research
              and education.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push({ pathname: ROUTES.signUp, query: { from: router.asPath } })}
            >
              Sign Up
            </Button>
            <Typography sx={{ mt: "20px" }}>
              Already a member?{" "}
              <Button
                variant="text"
                onClick={() => router.push({ pathname: ROUTES.signIn, query: { from: router.asPath } })}
              >
                Sign In
              </Button>
            </Typography>
          </Stack>
        </Box>
      </Modal>

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
        <MemoizedUserInfoSidebar
          theme={"Dark"}
          openLinkedNode={() => {}}
          open={openSidebar === "USER_INFO"}
          onClose={() => setOpenSidebar(null)}
          selectedUser={selectedUser}
        />

        {Object.keys(graph.nodes).length === 0 && (
          <NotebookPopup showIcon={false}>This notebook has no nodes</NotebookPopup>
        )}

        <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
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
              {nodeList}
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
            </Suspense>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NodePage;
