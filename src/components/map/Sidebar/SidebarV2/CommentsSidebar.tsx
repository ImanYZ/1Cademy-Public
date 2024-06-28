import { Box } from "@mui/material";
import React from "react";
import { UserTheme } from "src/knowledgeTypes";

import useDialog from "@/hooks/useConfirmDialog";

import Comment from "../../Comment/Comment";
import { SidebarWrapper } from "./SidebarWrapper";

type CommentsSidebarProps = {
  user: any;
  onlineUsers: any;
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
  notebookRef: any;
  nodeBookDispatch: any;
  nodeBookState: any;
  commentType: string;
};

export const CommentsSidebar = ({
  user,
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  onlineUsers,
}: CommentsSidebarProps) => {
  const { confirmIt } = useDialog();
  return (
    <SidebarWrapper
      id="comment"
      title={"Comments"}
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
      onlineUsers={onlineUsers}
      user={user}
      SidebarContent={
        <Box sx={{ marginTop: "22px" }}>
          <Comment user={user} concept={""} confirmIt={confirmIt} comments={[]} users={[]} />
        </Box>
      }
    />
  );
};

export const MemoizedCommentsSidebar = React.memo(CommentsSidebar);
