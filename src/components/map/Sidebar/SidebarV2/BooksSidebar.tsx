import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import Image from "next/image";
import React, { useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import YoutubeEmbed from "@/components/home/components/YoutubeEmbed";
import { Post } from "@/lib/mapApi";
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
  activeProposals: any;
  setActiveProposal: any;
};
interface Step {
  name: string;
  url?: string;
  steps?: Step[];
}

const BooksSidebar = ({
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  // activeProposals,
  setActiveProposal,
}: BooksSidebarProps) => {
  const db = getFirestore();
  const [pageContent, setPageContent] = useState<any>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
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
      const startIndex = Math.max(0, paragraphIdx - 2); // Ensure we don't go before the beginning of the array
      const endIndex = Math.min(paragraphIdx, pageContent.length); // Ensure we don't go beyond the end of the array
      const paragraphs = [...[...pageContent].slice(startIndex, endIndex), paragraph];
      const response: any = await Post("/onecademyAgent", { paragraphs });
      setActiveProposal(response.child_nodes);
    } catch (error) {
      console.error(error);
    }
  };

  const renderContent = () => {
    return (
      <>
        {pageContent.map((paragraph: any, idx: number) => (
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
      </>
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
