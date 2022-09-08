import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import React from "react";

import shortenNumber from "../../../lib/utils/shortenNumber";
import { MemoizedMetaButton } from "../MetaButton";

type BookmarksButton = { openSideBar: any };

const BookmarksButton = ({ openSideBar }: BookmarksButton) => {
  // const bookmarkUpdatesNum = useRecoilValue(bookmarkUpdatesNumState);
  const bookmarkUpdatesNum = 1;
  return (
    <MemoizedMetaButton
      onClick={() => openSideBar("Bookmarks")}
      // tooltip="Click to open the bookmarked nodes' updates."
      // tooltipPosition="Right"
    >
      <>
        <BookmarkBorderIcon className="material-icons" />
        <span className="SidebarDescription">Bookmarks</span>
        {bookmarkUpdatesNum > 0 && (
          <div className="NotificationsNum">{shortenNumber(bookmarkUpdatesNum, 2, false)}</div>
        )}
      </>
    </MemoizedMetaButton>
  );
};

export default React.memo(BookmarksButton);
