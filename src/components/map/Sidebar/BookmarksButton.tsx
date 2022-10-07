import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { Badge, Box } from "@mui/material";
import React from "react";

// import shortenNumber from "../../../lib/utils/shortenNumber";
import { MemoizedMetaButton } from "../MetaButton";

type BookmarksButton = { openSideBar: any; bookmarkUpdatesNum: number };

const BookmarksButton = ({ openSideBar, bookmarkUpdatesNum }: BookmarksButton) => {
  // const bookmarkUpdatesNum = useRecoilValue(bookmarkUpdatesNumState);
  // const bookmarkUpdatesNum = 1;
  return (
    <MemoizedMetaButton
      onClick={() => openSideBar("Bookmarks")}
      // tooltip="Click to open the bookmarked nodes' updates."
      // tooltipPosition="Right"
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "5px", height: "30px" }}>
        <Badge badgeContent={bookmarkUpdatesNum} color="error" anchorOrigin={{ vertical: "top", horizontal: "left" }}>
          <BookmarkBorderIcon className="material-icons" />
        </Badge>
        <span className="SidebarDescription">Bookmarks</span>
        {/* {bookmarkUpdatesNum > 0 && (
          <div className="NotificationsNum">{shortenNumber(bookmarkUpdatesNum, 2, false)}</div>
        )} */}
      </Box>
    </MemoizedMetaButton>
  );
};

export default React.memo(BookmarksButton);
