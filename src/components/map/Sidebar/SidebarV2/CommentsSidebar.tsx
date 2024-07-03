import { Box } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { commentChange, getCommentsSnapshot } from "src/client/firestore/comments.firestore";
import { IComment } from "src/commentTypes";
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
  const { confirmIt, ConfirmDialog } = useDialog();
  const [comments, setComments] = useState<IComment[]>([]);
  useEffect(() => {
    if (!user) return;
    setComments([]);
    const onSynchronize = (changes: commentChange[]) => {
      setComments(prev => changes.reduce(synchronizeStuff, [...prev]));
    };
    const killSnapshot = getCommentsSnapshot(
      db,
      { refId: commentSidebarInfo.id, type: commentSidebarInfo.type, lastVisible: null },
      onSynchronize
    );
    return () => killSnapshot();
  }, [db, user, commentSidebarInfo]);

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [comments, commentSidebarInfo]);

  return (
    <>
      <SidebarWrapper
        id="comment"
        title={"Comments"}
        open={open}
        onClose={onClose}
        width={sidebarWidth}
        innerHeight={innerHeight}
        showScrollUpButton={false}
        contentSignalState={contentSignalState}
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
              sidebarWidth={sidebarWidth}
              innerHeight={innerHeight || 0}
              setComments={setComments}
            />
          </Box>
        }
      />
      {ConfirmDialog}
    </>
  );
};

const areEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.user === nextProps.user &&
    prevProps.open === nextProps.open &&
    //prevProps.onClose === nextProps.onClose &&
    prevProps.sidebarWidth === nextProps.sidebarWidth &&
    prevProps.innerHeight === nextProps.innerHeight &&
    prevProps.theme === nextProps.theme &&
    prevProps.notebookRef === nextProps.notebookRef &&
    prevProps.nodeBookDispatch === nextProps.nodeBookDispatch &&
    prevProps.nodeBookState === nextProps.nodeBookState &&
    prevProps.onlineUsers === nextProps.onlineUsers &&
    prevProps.commentSidebarInfo === nextProps.commentSidebarInfo
  );
};

export const MemoizedCommentsSidebar = React.memo(CommentsSidebar, areEqual);

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
  prev.sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
  return prev;
};
