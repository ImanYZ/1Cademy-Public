import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import { Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import Image from "next/image";
import React, { useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import YoutubeEmbed from "@/components/home/components/YoutubeEmbed";
//import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { chapters } from "../../../../data/chapters";
import { SidebarWrapper } from "./SidebarWrapper";

type BooksSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  tagId: string | undefined;
  sidebarWidth: number;
  innerHeight?: number;
};
interface Step {
  name: string;
  url?: string;
  steps?: Step[];
}

const BooksSidebar = ({ open, onClose, sidebarWidth, innerHeight }: BooksSidebarProps) => {
  const db = getFirestore();
  const [pageContent, setPageContent] = useState<any>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [proposals] = useState<any>([
    {
      title: "Impact of Capitalism on Modern Living",
      content:
        "Capitalism has significantly transformed the way we live, influencing various aspects of society, economy, and individual lifestyles. This node explores how the capitalist system, characterized by private ownership and free markets, has led to innovations, increased productivity, and changes in consumption patterns, thereby reshaping modern life.",
      nodeType: "Concept",
      parents: [
        {
          node: "EconomicSystems",
          title: "Economic Systems",
        },
        {
          node: "Capitalism",
          title: "Capitalism",
        },
      ],
      reasoning:
        "The last paragraph highlights the revolutionary impact of capitalism on modern living. Creating a node that specifically addresses this transformation allows for a deeper understanding of capitalism's effects beyond its economic principles. It connects the theoretical aspects of capitalism with its practical implications on everyday life.",
      sentences: ["How capitalism revolutionized the way we live"],
    },
    {
      title: "Role of Economics in Understanding Economic Systems",
      content:
        "Economics plays a crucial role in analyzing and understanding the complexities of various economic systems, including capitalism. This node delves into the methodologies and tools economists use to study how economic systems operate, their impact on society, and the outcomes they produce.",
      nodeType: "Concept",
      parents: [
        {
          node: "Economics",
          title: "Economics",
        },
        {
          node: "EconomicSystems",
          title: "Economic Systems",
        },
      ],
      reasoning:
        "Given the paragraph's mention of economics' attempt to comprehend economic systems, it's pertinent to have a node dedicated to explaining how economics as a discipline contributes to our understanding of these systems. This node bridges the gap between the abstract study of economics and its practical application in analyzing real-world economic frameworks.",
      sentences: ["and how economics attempts to understand this and other economic systems"],
    },
  ]);
  const [selectedParagraphIdx, setSelectedParagraphIdx] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
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
  const proposeContent = async (paragraph: any, paragraphIdx: number) => {
    try {
      setSelectedParagraphIdx(paragraphIdx);
      //const startIndex = Math.max(0, paragraphIdx - 2); // Ensure we don't go before the beginning of the array
      //const endIndex = Math.min(paragraphIdx, pageContent.length); // Ensure we don't go beyond the end of the array
      //const paragraphs = [...[...pageContent].slice(startIndex, endIndex), paragraph];
      //const response: any = await Post("/onecademyAgent", { paragraphs });
      //setProposals([...response.improvements, ...response.child_nodes]);
    } catch (error) {
      console.error(error);
    }
  };
  const previousProposal = () => {
    setCurrentIdx(prev => Math.max(0, prev - 1));
  };

  const nextProposal = () => {
    setCurrentIdx(prev => Math.min(proposals.length - 1, prev + 1));
  };

  const renderProposals = () => {
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
              ":hover": {
                background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
              },
            }}
          >
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
        <hr />
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
      moveBack={selectedSection ? () => setSelectedSection(null) : null}
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
