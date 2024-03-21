import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { UserTheme } from "src/knowledgeTypes";

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
  setOpenBook: any;
  // innerWidth: number;
};

const BooksSidebar = ({
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  setOpenBook,
}: // innerWidth,
BooksSidebarProps) => {
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
            <Paper onClick={() => setOpenBook("Core Econ")} sx={{ p: "15px", cursor: "pointer" }}>
              The Economy
            </Paper>
          </Box>
        </Box>
      }
    />
  );
};

export const MemoizedBooksSidebar = React.memo(BooksSidebar);
