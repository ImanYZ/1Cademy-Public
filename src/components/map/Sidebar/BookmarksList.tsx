import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useState } from "react";

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
};

const ELEMENTS_PER_PAGE = 13;

export const BookmarksList = ({ openLinkedNode, bookmarks, updates }: BookmarksListProps) => {
  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);

  // useEffect(() => {
  //   // filter bookmarks from allNodes, then save the value
  //   let displayableNs = Object.keys(allNodes).map(nodeId => {
  //     if (
  //       nodeId in allUserNodes &&
  //       "bookmarked" in allUserNodes[nodeId] &&
  //       allUserNodes[nodeId].bookmarked &&
  //       ((!props.updates && !allUserNodes[nodeId].changed && allUserNodes[nodeId].isStudied) ||
  //         (props.updates && (allUserNodes[nodeId].changed || !allUserNodes[nodeId].isStudied)))
  //     ) {
  //       return { ...allNodes[nodeId], id: nodeId };
  //     }
  //   });
  //   displayableNs = displayableNs.filter(dN => dN);
  //   displayableNs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  //   setBookmarks(displayableNs);
  // }, [lastIndex, allNodes, allUserNodes]);

  // TODO: change to memo to not recalculate the function
  // with memo will reuse the value recalculated
  const getBookmarksProcessed = useCallback(() => {
    const bookmarksFiltered = bookmarks.filter(cur => {
      if (updates) return cur.changed || !cur.isStudied;
      return !cur.changed && cur.isStudied;
    });

    return bookmarksFiltered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [bookmarks, updates]);

  const loadOlderNotificationsClick = useCallback(() => {
    if (lastIndex >= getBookmarksProcessed().length) return;
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
  }, [getBookmarksProcessed, lastIndex]);

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
            sx={{ listStyle: "none", padding: "10px" /*  mx: "10px" */ }}
          >
            <div className="SidebarNodeTypeIcon" style={{ display: "flex", justifyContent: "space-between" }}>
              <NodeTypeIcon nodeType={node.nodeType} sx={{ fontSize: "16px" }} />
              <div className="right" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <MemoizedMetaButton
                // tooltip="Creation or the last update of this node."
                // tooltipPosition="TopLeft"
                >
                  <Box sx={{ fontSize: "15px" }}>
                    <CreateIcon className="material-icons grey-text" sx={{ fontSize: "16px" }} />
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
                // tooltip="# of 1Cademists who have found this node unhelpful."
                // tooltipPosition="TopLeft"
                >
                  <>
                    <CloseIcon className="material-icons grey-text" />
                    <span>{shortenNumber(node.wrongs, 2, false)}</span>
                  </>
                </MemoizedMetaButton>
                <MemoizedMetaButton
                // tooltip="# of 1Cademists who have found this node helpful."
                // tooltipPosition="TopLeft"
                >
                  <>
                    <DoneIcon className="material-icons DoneIcon grey-text" />
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
      {getBookmarksProcessed().length > lastIndex && (
        <div id="ContinueButton">
          <MemoizedMetaButton
            onClick={loadOlderNotificationsClick}
            // tooltip={"Load older " + (props.updates ? "updated" : "studied") + " bookmarks."}
            // tooltipPosition="Right"
          >
            <>
              <ExpandMoreIcon className="material-icons grey-text" />
              Older Bookmarks
              <ExpandMoreIcon className="material-icons grey-text" />
            </>
          </MemoizedMetaButton>
        </div>
      )}
    </Box>
  );
};
