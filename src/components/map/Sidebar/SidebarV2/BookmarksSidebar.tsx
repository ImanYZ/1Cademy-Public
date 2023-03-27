import { Box, Tab, Tabs } from "@mui/material";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import bookmarksDarkTheme from "../../../../../public/bookmarks-dark-mode.jpg";
import bookmarksLightTheme from "../../../../../public/bookmarks-light-theme.jpg";
import { buildFullNodes, getNodes } from "../../../../lib/utils/nodesSyncronization.utils";
import { FullNodeData, FullNodesData, UserNodeChanges, UserNodesData } from "../../../../nodeBookTypes";
import { BookmarksList } from "../BookmarksList";
import { SidebarWrapper } from "./SidebarWrapper";

type SearcherSidebarProps = {
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

export const BookmarksSidebar = ({
  open,
  onClose,
  theme,
  username,
  openLinkedNode,
  sidebarWidth,
  innerHeight,
  innerWidth,
  bookmark,
}: SearcherSidebarProps) => {
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
          uNodeData: cur.doc.data() as UserNodesData,
        };
      });

      const bookmarksNodeIds = bookmarksUserNodes.map(cur => cur.uNodeData.node);
      const bookmarksNodesData = await getNodes(db, bookmarksNodeIds);
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
      title="Bookmarks"
      headerImage={theme === "Dark" ? bookmarksDarkTheme : bookmarksLightTheme}
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      // anchor="right"
      SidebarOptions={
        <Box
          sx={{
            borderBottom: 1,
            borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
            width: "100%",
          }}
        >
          <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"}>
            {[{ title: "Updated" }, { title: "Studied" }].map((tabItem: any, idx: number) => (
              <Tab
                key={tabItem.title}
                id={`bookmarks-tab-${tabItem.title.toLowerCase()}`}
                label={tabItem.title}
                {...a11yProps(idx)}
              />
            ))}
          </Tabs>
        </Box>
      }
      contentSignalState={contentSignalState}
      SidebarContent={
        <Box sx={{ p: "2px 4px" }}>
          {value === 0 && (
            <BookmarksList
              openLinkedNode={openLinkedNode}
              updates={true}
              bookmarks={bookmarkedUserNodes}
              bookmark={bookmark}
            />
          )}
          {value === 1 && (
            <BookmarksList
              openLinkedNode={openLinkedNode}
              updates={false}
              bookmarks={bookmarkedUserNodes}
              bookmark={bookmark}
            />
          )}
        </Box>
      }
    />
  );
};

export const MemoizedBookmarksSidebar = React.memo(BookmarksSidebar);
