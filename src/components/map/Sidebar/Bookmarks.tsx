import React from "react";

import { MemoizedSidebarTabs } from "../SidebarTabs/SidebarTabs";
import { BookmarksList } from "./BookmarksList";

// import SidebarTabs from "../../SidebarTabs/SidebarTabs";
// import BookmarksList from "../BookmarksList/BookmarksList";

// import "./Bookmarks.css";
type BookmarksProps = {
  openLinkedNode: any;
  bookmarkedUserNodes: any[];
};

const Bookmarks = (props: BookmarksProps) => {
  // const updatedBookmarks = props.bookmarkedUserNodes.filter(cur=>cur)
  const tabsItems = [
    {
      title: "Updated",
      content: (
        <BookmarksList
          openLinkedNode={props.openLinkedNode}
          updates={true}
          bookmarks={props.bookmarkedUserNodes} /*openSection={false}*/
        />
      ),
    },
    {
      title: "Studied",
      content: (
        <BookmarksList
          openLinkedNode={props.openLinkedNode}
          updates={false}
          bookmarks={props.bookmarkedUserNodes} /*openSection={true} */
        />
      ),
    },
  ];

  return <MemoizedSidebarTabs tabsTitle="Bookmarks tabs" tabsItems={tabsItems} />;
};

export default React.memo(Bookmarks);
