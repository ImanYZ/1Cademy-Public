import { Box } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { commentChange, getCommentsSnapshot } from "src/client/firestore/comments.firestore";
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
  commentSidebarInfo: { type: string; id: string };
};

export const CommentsSidebar = ({
  user,
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  onlineUsers,
  commentSidebarInfo,
}: CommentsSidebarProps) => {
  const db = getFirestore();
  const { confirmIt } = useDialog();
  const [comments, setComments] = useState<any>([]);
  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: commentChange[]) => {
      setComments((prev: any) => changes.reduce(synchronizeStuff, [...prev]));
    };
    const killSnapshot = getCommentsSnapshot(
      db,
      { refId: commentSidebarInfo.id, type: commentSidebarInfo.type, lastVisible: null },
      onSynchronize
    );
    return () => killSnapshot();
  }, [db, user]);

  return (
    <SidebarWrapper
      id="comment"
      title={"Comments"}
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      innerHeight={innerHeight}
      showScrollUpButton={false}
      contentSignalState={() => {}}
      onlineUsers={onlineUsers}
      user={user}
      SidebarContent={
        <Box sx={{ marginTop: "22px" }}>
          <Comment
            user={user}
            concept={""}
            confirmIt={confirmIt}
            comments={comments}
            users={[]}
            commentSidebarInfo={commentSidebarInfo}
          />
        </Box>
      }
    />
  );
};

export const MemoizedCommentsSidebar = React.memo(CommentsSidebar);

const synchronizeStuff = (prev: (any & { id: string })[], change: any) => {
  const docType = change.type;
  const curData = change.data as any & { id: string };

  const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
  if (docType === "added" && prevIdx === -1) {
    prev.push(curData);
  }
  if (docType === "modified" && prevIdx !== -1) {
    prev[prevIdx] = curData;
  }

  if (docType === "removed" && prevIdx !== -1) {
    prev.splice(prevIdx, 1);
  }
  prev.sort((a, b) => b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime());
  return prev;
};
