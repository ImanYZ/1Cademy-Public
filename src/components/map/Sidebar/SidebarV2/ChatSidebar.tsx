import { Box, Tab, Tabs } from "@mui/material";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import { buildFullNodes, getNodesPromises } from "../../../../lib/utils/nodesSyncronization.utils";
import { FullNodeData, FullNodesData, UserNodeChanges, UserNodeFirestore } from "../../../../nodeBookTypes";
import { ChannelsList } from "../Chat/List/Channels";
import { DirectMessagesList } from "../Chat/List/Direct";
import { NewsCard } from "../Chat/Room/NewsCard";
//import { Message } from "../Chat/Message";
import { SidebarWrapper } from "./SidebarWrapper";

type ChatSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
  bookmark: any;
};

export const ChatSidebar = ({ open, onClose, username, sidebarWidth, innerHeight, innerWidth }: ChatSidebarProps) => {
  const db = getFirestore();
  const [bookmarks, setBookmarks] = useState<FullNodesData>({});
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const mergeAllNodes = (newAllNodes: FullNodeData[], currentAllNodes: FullNodesData): FullNodesData => {
    return newAllNodes.reduce(
      (acu, cur) => {
        if (cur.nodeChangeType === "added" || cur.nodeChangeType === "modified") {
          return { ...acu, [cur.node]: cur };
        }
        if (cur.nodeChangeType === "removed") {
          const tmp = { ...acu };
          delete tmp[cur.node];
          return tmp;
        }
        return acu;
      },
      { ...currentAllNodes }
    );
  };

  useEffect(() => {
    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", username),
      where("bookmarked", "==", true),
      where("deleted", "==", false)
    );

    const bookmarkSnapshot = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return null;

      const bookmarksUserNodes: UserNodeChanges[] = docChanges.map((cur): UserNodeChanges => {
        return {
          cType: cur.type,
          uNodeId: cur.doc.id,
          uNodeData: cur.doc.data() as UserNodeFirestore,
        };
      });

      const bookmarksNodeIds = bookmarksUserNodes.map(cur => cur.uNodeData.node);
      const bookmarksNodesData = await getNodesPromises(db, bookmarksNodeIds);
      const fullNodes = buildFullNodes(bookmarksUserNodes, bookmarksNodesData);
      setBookmarks(oldFullNodes => mergeAllNodes(fullNodes, oldFullNodes));
    });
    return () => {
      bookmarkSnapshot();
    };
  }, [db, username]);

  const bookmarkedUserNodes = useMemo(() => {
    return Object.keys(bookmarks).map(key => bookmarks[key]);
  }, [bookmarks]);

  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [bookmarkedUserNodes, value]);

  return (
    <SidebarWrapper
      title="1Cademy Chat"
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      sx={{
        boxShadow: "none",
      }}
      // anchor="right"
      SidebarOptions={
        <Box
          sx={{
            marginTop: "20px",
            borderBottom: 1,
            borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
            width: "100%",
          }}
        >
          <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"} variant="fullWidth">
            {[{ title: "News" }, { title: "Channels" }, { title: "Direct" }].map((tabItem: any, idx: number) => (
              <Tab
                key={tabItem.title}
                id={`chat-tab-${tabItem.title.toLowerCase()}`}
                label={tabItem.title}
                {...a11yProps(idx)}
              />
            ))}
          </Tabs>
        </Box>
      }
      contentSignalState={contentSignalState}
      SidebarContent={
        <Box sx={{ p: "2px 16px" }}>
          {value === 0 && (
            <NewsCard
              tag="1cademy"
              image="https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FJqxTY6ZE08dudguFF0KDPqbkoZt2%2FWed%2C%2018%20Jan%202023%2022%3A14%3A06%20GMT_430x1300.jpeg?alt=media&token=9ef2b4e0-1d78-483a-ae3d-79c2007dfb31"
              text={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
              }
              heading="Card Test Heading"
            />
          )}
          {value === 1 && <ChannelsList />}
          {value === 2 && <DirectMessagesList />}
        </Box>
      }
    />
  );
};

export const MemoizedChatSidebar = React.memo(ChatSidebar);
