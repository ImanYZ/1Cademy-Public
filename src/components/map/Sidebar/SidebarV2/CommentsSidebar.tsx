import { Box } from "@mui/material";
import React from "react";
import { UserTheme } from "src/knowledgeTypes";

import { SidebarWrapper } from "./SidebarWrapper";

type CommentsSidebarProps = {
  user: any;
  settings: any;
  onlineUsers: any;
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
  bookmark: any;
  notebookRef: any;
  nodeBookDispatch: any;
  nodeBookState: any;
  notebooks: any;
  onChangeNotebook: any;
  selectedNotebook: any;
  dispatch: any;
  onChangeTagOfNotebookById: any;
  notifications: any;
  openUserInfoSidebar: any;
};

export const CommentsSidebar = ({
  user,
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  onlineUsers,
}: CommentsSidebarProps) => {
  return (
    <SidebarWrapper
      id="chat"
      title={""}
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={100}
      innerHeight={innerHeight}
      sx={{
        boxShadow: "none",
      }}
      showScrollUpButton={false}
      contentSignalState={() => {}}
      sidebarType={"chat"}
      onlineUsers={onlineUsers}
      user={user}
      SidebarContent={<Box sx={{ marginTop: "22px" }}></Box>}
    />
  );
};

export const MemoizedChatSidebar = React.memo(CommentsSidebar);
