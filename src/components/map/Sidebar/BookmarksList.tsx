import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useEffect, useState } from "react";

import { useInView } from "../../../hooks/useObserver";
import shortenNumber from "../../../lib/utils/shortenNumber";
import { Editor } from "../../Editor";
import NodeTypeIcon from "../../NodeTypeIcon2";
import { MemoizedMetaButton } from "../MetaButton";

dayjs.extend(relativeTime);
const doNothing = () => {};

type BookmarksListProps = {
  openLinkedNode: any;
  updates: boolean;
  bookmarks: any[];
  bookmark: any;
};

const ELEMENTS_PER_PAGE = 13;

export const BookmarksList = ({ openLinkedNode, bookmarks, updates, bookmark }: BookmarksListProps) => {
  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);
  const [isRetrieving, setIsRetrieving] = useState(false);

  const { ref: refInfinityLoaderTrigger, inView: inViewInfinityLoaderTrigger } = useInView();

  // TODO: improve with memo to not recalculate in every render
  const getBookmarksProcessed = useCallback(() => {
    const bookmarksFiltered = bookmarks.filter(cur => {
      if (updates) return cur.changed || !cur.isStudied;
      return !cur.changed && cur.isStudied;
    });

    return bookmarksFiltered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [bookmarks, updates]);

  const loadOlderNotificationsClick = useCallback(() => {
    if (lastIndex >= getBookmarksProcessed().length) return;
    setIsRetrieving(true);
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
    setTimeout(() => {
      setIsRetrieving(false);
    }, 500);
  }, [getBookmarksProcessed, lastIndex]);

  useEffect(() => {
    if (!inViewInfinityLoaderTrigger) return;
    if (isRetrieving) return;

    loadOlderNotificationsClick();
  }, [inViewInfinityLoaderTrigger, isRetrieving, loadOlderNotificationsClick]);

  const bookmarkHandler = useCallback((event: any, identifier: string) => bookmark(event, identifier), [bookmark]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {getBookmarksProcessed()
        .slice(0, lastIndex)
        .map((node: any) => (
          <Paper
            elevation={3}
            className="CollapsedProposal collection-item"
            // CHECK: I changed: node.id to node.userNodeId
            key={`node${node.userNodeId}`}
            onClick={() => openLinkedNode(node.node)}
            sx={{
              listStyle: "none",
              padding: {
                xs: "5px 10px",
                sm: "10px",
              },
              cursor: "pointer",
            }}
          >
            <div className="SidebarNodeTypeIcon" style={{ display: "flex", justifyContent: "space-between" }}>
              <NodeTypeIcon nodeType={node.nodeType} sx={{ fontSize: "16px" }} />
              <div className="right" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <MemoizedMetaButton tooltip="Unbookmark this node." tooltipPosition="top" style={{ padding: "0" }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center" }}
                    onClick={event => bookmarkHandler(event, node.node)}
                  >
                    <BookmarkIcon color={"primary"} sx={{ fontSize: "16px" }} />
                  </Box>
                </MemoizedMetaButton>
                <MemoizedMetaButton tooltip="Creation or the last update of this node." tooltipPosition="top-start">
                  <Box sx={{ fontSize: "15px" }}>
                    <CreateIcon className=" grey-text" sx={{ fontSize: "16px" }} />
                    {dayjs(node.changedAt).fromNow()}
                  </Box>
                  {/* </MetaButton>
          <MetaButton
            tooltip="# of improvement/child proposals on this node."
            tooltipPosition="BottomLeft"
          > */}
                  {/* <span>{shortenNumber(node.versions, 2, false)}</span> */}
                </MemoizedMetaButton>
                <MemoizedMetaButton
                  tooltip="# of 1Cademists who have found this node unhelpful."
                  tooltipPosition="top-start"
                >
                  <>
                    <CloseIcon className="grey-text" sx={{ fontSize: "16px" }} />
                    <span>{shortenNumber(node.wrongs, 2, false)}</span>
                  </>
                </MemoizedMetaButton>
                <MemoizedMetaButton
                  tooltip="# of 1Cademists who have found this node helpful."
                  tooltipPosition="top-start"
                >
                  <>
                    <DoneIcon className=" grey-text" sx={{ fontSize: "16px" }} />
                    <span>{shortenNumber(node.corrects, 2, false)}</span>
                  </>
                </MemoizedMetaButton>
              </div>
            </div>
            <div className="SearchResultTitle">
              <Editor readOnly={true} setValue={doNothing} value={node.title} label="" />
            </div>
          </Paper>
        ))}
      {getBookmarksProcessed().length > lastIndex && <Box id="ContinueButton" ref={refInfinityLoaderTrigger} />}
    </Box>
  );
};
