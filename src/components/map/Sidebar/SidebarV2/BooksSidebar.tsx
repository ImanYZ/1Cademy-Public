import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { UserTheme } from "src/knowledgeTypes";

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
  setHtmlContent: any;
  // innerWidth: number;
};
interface Step {
  name: string;
  steps: { url: string; name: string }[];
}

const BooksSidebar = ({
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  setHtmlContent,
}: // innerWidth,
BooksSidebarProps) => {
  const handleLabelClick = async (event: any, node: any) => {
    try {
      if (!node?.url) return;
      let url = `core-econ/microeconomics/pages/${node.url}`;
      const response = await fetch(url);
      const html = await response.text();
      setHtmlContent(html);
    } catch (error) {
      console.error("Error loading HTML:", error);
    }
  };

  const renderTree = (nodes: Step[]) =>
    nodes.map(node => (
      <TreeItem
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
      sx={{
        boxShadow: "none",
      }}
      SidebarContent={
        <Box sx={{ p: "10px" }}>
          <Box sx={{ mt: "10px" }}>
            <Paper sx={{ p: "15px", cursor: "pointer" }}>The Economy</Paper>
          </Box>
          <Box mt={2}>
            <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />} multiSelect>
              {renderTree(chapters)}
            </TreeView>
          </Box>
        </Box>
      }
    />
  );
};

export const MemoizedBooksSidebar = React.memo(BooksSidebar);
