import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import { Button, LinearProgress, Paper, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import { Box } from "@mui/system";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import Image from "next/image";
import React, { useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import YoutubeEmbed from "@/components/home/components/YoutubeEmbed";
import { Post } from "@/lib/mapApi";
//import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { chapters } from "../../../../data/chapters";
import { SidebarWrapper } from "./SidebarWrapper";

type BooksSidebarProps = {
  notebookRef: any;
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openNodeHandler: any;
  proposeNewChild: any;
  proposeNodeImprovement: any;
  username: string;
  tagId: string | undefined;
  sidebarWidth: number;
  innerHeight?: number;
  graph: any;
  setAbleToPropose: any;
  setNodeUpdates: any;
  setGraph: any;
};
interface Step {
  name: string;
  url?: string;
  steps?: Step[];
}

const BooksSidebar = ({
  notebookRef,
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  openNodeHandler,
  proposeNewChild,
  graph,
  proposeNodeImprovement,
  setAbleToPropose,
  setNodeUpdates,
  setGraph,
}: BooksSidebarProps) => {
  const db = getFirestore();
  const [pageContent, setPageContent] = useState<any>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [proposals, setProposals] = useState<any>([]);
  const [selectedParagraphIdx, setSelectedParagraphIdx] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const handleLabelClick = async (event: any, node: any) => {
    try {
      if (!node?.url) return;
      // let url = `core-econ/microeconomics/pages/${node.url}`;
      // const response = await fetch(url);
      // const html = await response.text();
      // const parser = new DOMParser();
      // const doc = parser.parseFromString(html, "text/html");

      // const elementsWithPrefix = doc.querySelectorAll("*");
      // elementsWithPrefix.forEach(element => {
      //   console.log(element, "element");
      //   // Do whatever you want with each element
      // });
      const q = query(collection(db, "chaptersBook"), where("url", "==", node.url));
      const docs = await getDocs(q);
      const chapterContent = docs.docs[0].data()?.paragraphs || [];
      setPageContent(chapterContent);
      setSelectedSection(node.url);
    } catch (error) {
      console.error("Error loading HTML:", error);
    }
  };
  const generateHash = (text: string) => {
    let hash = 0;
    if (text.length === 0) {
      return hash;
    }
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  };

  const proposeContent = async (paragraph: any, paragraphIdx: number) => {
    try {
      setSelectedParagraphIdx(paragraphIdx);
      const startIndex = Math.max(0, paragraphIdx - 2); // Ensure we don't go before the beginning of the array
      const endIndex = Math.min(paragraphIdx, pageContent.length); // Ensure we don't go beyond the end of the array
      const paragraphs = [...[...pageContent].slice(startIndex, endIndex), paragraph];

      setLoadingProposals(true);
      const response: any = await Post("/onecademyAgent", { paragraphs });

      const responseProposals = [...response.child_nodes];
      const responseImprovement = [...response.improvements];
      responseImprovement.map(proposal => {
        proposal.improvement = true;
        proposal.title = proposal.new_title;
      });
      setProposals([...responseProposals, ...responseImprovement]);

      setTimeout(() => {
        if (!responseProposals.length) return;
        const newProposal = responseProposals[0];
        if (!newProposal.improvement) {
          const parents = newProposal?.parents || [];
          if (parents.length > 0) {
            for (const parent of parents) {
              openNodeHandler(parent.node);
            }
          }
        } else {
          openNodeHandler(newProposal.node);
        }
        displayNewImprovement(newProposal, paragraphIdx);
      }, 500);
      setLoadingProposals(false);
    } catch (error) {
      console.error(error);
    }
  };
  const cancelProposal = () => {
    const cancelButton: any = document.querySelector('[id$="-button-cancel-proposal"]');
    if (cancelButton) {
      cancelButton.click();
    }
  };
  const previousProposal = () => {
    cancelProposal();
    setCurrentIdx(prev => {
      prev = Math.max(0, prev - 1);
      displayTheNewNode(prev);
      return prev;
    });
  };

  const nextProposal = () => {
    cancelProposal();
    setCurrentIdx(prev => {
      prev = Math.min(proposals.length - 1, prev + 1);
      displayTheNewNode(prev);
      return prev;
    });
  };
  const displayNewImprovement = (newProposal: any, paragraphIdx: number | null = null) => {
    const _paragraphIdx = selectedParagraphIdx === null ? paragraphIdx : selectedParagraphIdx;
    if (_paragraphIdx === null) return;
    const selectedNodeId = notebookRef.current.selectedNode!;

    const parents = newProposal?.parents || [];

    const references = ["CORE Econ - The Economy"];
    const referenceIds = ["6J7aOVSsrMnrbgkzDq9J"];

    const referenceLabels = [selectedSection];
    const paragraphsIds = { "0": [generateHash(pageContent[_paragraphIdx].text)] };

    if (!newProposal.improvement) {
      const nodeType = newProposal.nodeType.toLowerCase() === "concept" ? "Concept" : "Relation";

      if (parents.some((p: { node: string }) => p.node === selectedNodeId) && graph.nodes[selectedNodeId]) {
        proposeNewChild(
          null,
          nodeType,
          newProposal.title,
          newProposal.content,
          references,
          referenceIds,
          referenceLabels,
          paragraphsIds
        );
      }
    } else if (newProposal.node) {
      proposeNodeImprovement(null, newProposal.node);
      const { /*  old_title, */ new_title, content, addedParents, addedChildren, removedParents, removedChildren } =
        newProposal;
      // to apply assistant potential improvement on node editor
      setTimeout(() => {
        setGraph((graph: any) => {
          let newGraph = {
            ...graph,
            nodes: { ...graph.nodes },
          };
          let newNode = { ...newGraph.nodes[newProposal.node] };
          newNode.title = new_title;
          newNode.content = content;
          newNode.open = true;
          // add children and parents to the node
          for (let addedChild of addedChildren) {
            const { node, title, type } = addedChild;
            newNode.children.push({
              node,
              type,
              title,
              label: "",
              visible: false,
            });
          }
          for (let addedParent of addedParents) {
            const { node, title, type } = addedParent;
            newNode.parents.push({
              node,
              type,
              title,
              label: "",
              visible: false,
            });
          }
          // remove children and parents from the node
          const removedChildrenIds = removedChildren.map((child: { node: string; title: string }) => child.node);
          const removedParentsIds = removedParents.map((child: { node: string; title: string }) => child.node);
          newNode.children = newNode.children.filter((child: any) => removedChildrenIds.includes(child.node));
          newNode.children = newNode.parents.filter((child: any) => removedParentsIds.includes(child.node));

          // adding reference of book
          if (!newNode.referenceIds.includes("6J7aOVSsrMnrbgkzDq9J")) {
            newNode.referenceIds = [...(newNode.referenceIds || []), "6J7aOVSsrMnrbgkzDq9J"];
            newNode.references = [...(newNode.references || []), "CORE Econ - The Economy"];
          }
          if (!newNode.referenceLabels.includes(selectedSection)) {
            newNode.referenceLabels = [...(newNode.referenceLabels || []), selectedSection];
          }
          newGraph.nodes[newProposal.node] = newNode;
          return newGraph;
        });
        setAbleToPropose(true);
        setNodeUpdates({
          nodeIds: [newProposal.node],
          updatedAt: new Date(),
        });
      }, 1000);
    }
  };

  const displayTheNewNode = async (proposalIdx: number) => {
    const newProposal = proposals[proposalIdx];
    const parents = newProposal?.parents || [];
    if (!newProposal.improvement) {
      if (parents.length > 0) {
        for (const parent of parents) {
          openNodeHandler(parent.node);
        }
      }
    } else {
      openNodeHandler(newProposal.node);
    }

    setTimeout(() => {
      if (!proposals.length) return;
      displayNewImprovement(newProposal);
    }, 6000);
  };

  const renderProposals = () => {
    if (loadingProposals) {
      return <LinearProgress sx={{ width: "100%" }} />;
    }
    if (proposals.length <= 0) {
      return (
        <Box>
          <Alert
            severity="error"
            sx={{
              p: "24px 20px",
              mb: "16px",
              borderRadius: "12px",

              fontWeight: 500,
              fontSize: "14px",
              "& svg": {
                fill: "common.black",
              },
            }}
          >
            Cannot propose any new children or improvements from this paragraph!
          </Alert>
        </Box>
      );
    }
    return (
      <Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              padding: { xs: "5px 10px", sm: "15px" },
              borderRadius: "8px",
              boxShadow: theme =>
                theme.palette.mode === "light"
                  ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                  : undefined,
              cursor: "pointer",
              background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
              // ":hover": {
              //   background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
              // },
            }}
          >
            {proposals[currentIdx]?.improvement ? (
              <Typography sx={{ color: "orange" }}>Node Improvement</Typography>
            ) : (
              <Typography sx={{ color: "orange" }}>New Child</Typography>
            )}
            <Typography variant="h3">{proposals[currentIdx]?.title}</Typography>
            <Typography variant="body1">{proposals[currentIdx]?.content}</Typography>
          </Paper>
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            mt: "10px",
          }}
        >
          <Button
            variant="contained"
            onClick={previousProposal}
            disabled={currentIdx === 0}
            sx={{
              backgroundColor: "info.main",
              color: "white",
              "&:hover": {
                backgroundColor: "info.light",
              },
              flex: 1,
            }}
          >
            <ArrowBackIcon sx={{ marginRight: "7px" }} />
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={nextProposal}
            disabled={currentIdx === proposals.length - 1}
            sx={{
              backgroundColor: "info.main",
              color: "white",
              "&:hover": {
                backgroundColor: "info.light",
              },
              ml: "5px",
              flex: 1,
            }}
          >
            Next
            <ArrowForwardIcon sx={{ marginLeft: "7px" }} />
          </Button>
        </Box>
      </Box>
    );
  };

  const renderContent = () => {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {pageContent
          .filter((content: any, idx: number) => (selectedParagraphIdx !== null ? idx === selectedParagraphIdx : true))
          .map((paragraph: any, idx: number) => (
            <Paper
              key={idx}
              onClick={() => {
                proposeContent(paragraph, idx);
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                padding: { xs: "5px 10px", sm: "15px" },
                borderRadius: "8px",
                boxShadow: theme =>
                  theme.palette.mode === "light"
                    ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                    : undefined,
                cursor: "pointer",
                background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
                ":hover": {
                  background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
                },
              }}
            >
              {paragraph.storageLink ? (
                <Image src={paragraph.storageLink} alt={paragraph.text} width={300} height={300} />
              ) : paragraph?.youtubeId || paragraph?.link ? (
                <YoutubeEmbed embedId={paragraph?.youtubeId || paragraph?.link} />
              ) : (
                <Typography>{paragraph.text}</Typography>
              )}
            </Paper>
          ))}

        {selectedParagraphIdx !== null && renderProposals()}
      </Box>
    );
  };

  const renderTree = (nodes: Step[]) =>
    nodes.map(node => (
      <TreeItem
        sx={{
          background: selectedSection && selectedSection == node?.url ? DESIGN_SYSTEM_COLORS.orange400 : undefined,
        }}
        key={node.name}
        nodeId={node.name}
        label={
          <div
            onClick={event => {
              handleLabelClick(event, node);
            }}
            style={{
              padding: "10px",
              cursor: "pointer",
            }}
          >
            {node.name}
          </div>
        }
      >
        {Array.isArray(node.steps) ? renderTree(node.steps) : null}
      </TreeItem>
    ));
  const moveBack = () => {
    if (selectedSection) {
      setSelectedSection(null);
      setSelectedParagraphIdx(null);
      setProposals([]);
      cancelProposal();
    }
  };

  return (
    <SidebarWrapper
      id="sidebar-wrapper-book-list"
      title="Books"
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      // height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      contentSignalState={() => {}}
      moveBack={moveBack}
      sx={{
        boxShadow: "none",
      }}
      SidebarContent={
        <Box sx={{ p: "0px 10px 10px 10px" }}>
          <Box sx={{ mt: "10px" }}>
            <Paper sx={{ p: "15px", cursor: "pointer" }}>The Economy</Paper>
          </Box>
          <Box mt={2}>
            {selectedSection && renderContent()}
            {!selectedSection && (
              <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />} multiSelect>
                {renderTree(chapters)}
              </TreeView>
            )}
          </Box>
        </Box>
      }
    />
  );
};

export const MemoizedBooksSidebar = React.memo(BooksSidebar);
