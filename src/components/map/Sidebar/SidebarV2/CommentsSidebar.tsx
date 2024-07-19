import { Box } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, query, where, writeBatch } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  commentSidebarInfo: { type: string; id: string; proposal?: any };
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
  const [users, setUsers] = useState<any>([]);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setComments([]);
    const onSynchronize = (changes: commentChange[]) => {
      setComments(prev => changes.reduce(synchronizeStuff, [...prev]));
      setIsLoading(false);
    };
    const killSnapshot = getCommentsSnapshot(
      db,
      { refId: commentSidebarInfo.id, type: commentSidebarInfo.type, lastVisible: null },
      onSynchronize
    );
    return () => killSnapshot();
  }, [db, user, commentSidebarInfo]);

  useEffect(() => {
    (async () => {
      const nodeQ = doc(
        db,
        "nodes",
        commentSidebarInfo.type === "node" ? commentSidebarInfo.id : commentSidebarInfo.proposal.node
      );
      const nodeDoc = await getDoc(nodeQ);
      if (nodeDoc.exists()) {
        const nodeData = nodeDoc.data();
        const members: any = nodeData.contribNames.map((contrib: any) => {
          return {
            id: contrib,
            display: nodeData.contributors[contrib].fullname,
            imageUrl: nodeData.contributors[contrib].imageUrl,
          };
        });
        setUsers(members);
        setFirstLoad(false);
      }
    })();
  }, [db]);
  useEffect(() => {
    if (!comments.length) return;
    const mentionUsers = findMentionUsers(users);
    setUsers(mentionUsers);
  }, [comments, firstLoad]);

  useEffect(() => {
    (async () => {
      const batch = writeBatch(db);
      const q = query(
        query(collection(db, "notifications")),
        where("proposer", "==", user.uname),
        where("refId", "==", commentSidebarInfo.id),
        where("checked", "==", false),
        where("oType", "==", "Comment")
      );
      const notificatioDoc = await getDocs(q);
      for (const notification of notificatioDoc.docs) {
        batch.update(notification.ref, {
          checked: true,
          updatedAt: new Date(),
        });
      }
      await batch.commit();
    })();
  }, [db, user]);

  const findMentionUsers = useCallback(
    (users: { id: string; display: string; imageUrl: string }[]) => {
      const newUsers: { id: string; display: string; imageUrl: string }[] = users;
      comments.map(comment => {
        const findUser = newUsers.find((user: any) => user.id === comment.sender);
        if (!findUser) {
          newUsers.push({
            id: comment.sender,
            display: comment?.senderDetail?.fullname || "",
            imageUrl: comment?.senderDetail?.imageUrl,
          });
        }
      });
      return newUsers;
    },
    [comments, users]
  );

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [users, comments, commentSidebarInfo, firstLoad]);

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
              users={users}
              commentSidebarInfo={commentSidebarInfo}
              sidebarWidth={sidebarWidth}
              innerHeight={innerHeight || 0}
              setComments={setComments}
              firstLoad={firstLoad}
              isLoading={isLoading}
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
