import React from "react";

import { MemoizedSidebarTabs } from "../SidebarTabs/SidebarTabs";
import { BookmarksList } from "./BookmarksList";

// import SidebarTabs from "../../SidebarTabs/SidebarTabs";
// import BookmarksList from "../BookmarksList/BookmarksList";

// import "./Bookmarks.css";
type BookmarksProps = {
  openLinkedNode: any;
};

const Bookmarks = (props: BookmarksProps) => {
  const tabsItems = [
    {
      title: "Updated",
      content: <BookmarksList openLinkedNode={props.openLinkedNode} updates={true} /*openSection={false}*/ />,
    },
    {
      title: "Studied",
      content: <BookmarksList openLinkedNode={props.openLinkedNode} updates={false} /*openSection={true} */ />,
    },
  ];

  return <MemoizedSidebarTabs tabsTitle="Bookmarks tabs" tabsItems={tabsItems} />;
};

export default React.memo(Bookmarks);
