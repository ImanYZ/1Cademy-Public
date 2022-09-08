/* eslint-disable @typescript-eslint/no-unused-vars */
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useEffect, useState } from "react";

import shortenNumber from "../../../lib/utils/shortenNumber";
import { Editor } from "../../Editor";
import NodeTypeIcon from "../../NodeTypeIcon2";
import { MemoizedMetaButton } from "../MetaButton";

dayjs.extend(relativeTime);
const doNothing = () => {};

type BookmarksListProps = {
  openLinkedNode: any;
  updates: boolean;
};

export const BookmarksList = ({ openLinkedNode }: BookmarksListProps) => {
  const [bookmarks, setBookmarks] = useState([
    {
      id: "sdlflskdf",
      nodeType: "Concept",
      changedAt: new Date(),
      wrongs: 2,
      corrects: 6,
      title: "mock Node",
    },
  ]);
  const [lastIndex, setLastIndex] = useState(13);

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

  // const loadOlderNotificationsClick = useCallback(
  //   () =>
  //     setLastIndex(oldLastIndex => {
  //       if (lastIndex < Object.keys(allNodes).length) {
  //         return oldLastIndex + 13;
  //       }
  //       return oldLastIndex;
  //     }),
  //   [allNodes]
  // );

  return (
    <>
      {bookmarks.slice(0, lastIndex).map((node: any) => (
        <li
          className="CollapsedProposal collection-item"
          key={`node${node.id}`}
          onClick={openLinkedNode(node.id)}
          style={{ listStyle: "none", padding: "10px" }}
        >
          <div className="SidebarNodeTypeIcon" style={{ display: "flex", justifyContent: "space-between" }}>
            <NodeTypeIcon nodeType={node.nodeType} />
            <div className="right">
              <MemoizedMetaButton
              // tooltip="Creation or the last update of this node."
              // tooltipPosition="TopLeft"
              >
                <>
                  <CreateIcon className="material-icons grey-text" />
                  {dayjs(node.changedAt).fromNow()}
                </>
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
        </li>
      ))}
      {bookmarks.length > lastIndex && (
        <div id="ContinueButton">
          <MemoizedMetaButton
            onClick={() => console.log("loadOlderNotificationsClick")}
            // tooltip={"Load older " + (props.updates ? "updated" : "studied") + " bookmarks."}
            // tooltipPosition="Right"
          >
            <>
              <i className="material-icons grey-text">expand_more</i> Older Bookmarks{" "}
              <i className="material-icons grey-text">expand_more</i>
            </>
          </MemoizedMetaButton>
        </div>
      )}
    </>
  );
};

// const doNothing = () => {};

// // dayjs.extend(relativeTime);

// const BookmarksList = (props) => {
//   const allNodes = useRecoilValue(allNodesState);
//   const allUserNodes = useRecoilValue(allUserNodesState);

//   const [bookmarks, setBookmarks] = useState([]);
//   const [lastIndex, setLastIndex] = useState(13);

//   useEffect(() => {
//     let displayableNs = Object.keys(allNodes).map((nodeId) => {
//       if (
//         nodeId in allUserNodes &&
//         "bookmarked" in allUserNodes[nodeId] &&
//         allUserNodes[nodeId].bookmarked &&
//         ((!props.updates && !allUserNodes[nodeId].changed && allUserNodes[nodeId].isStudied) ||
//           (props.updates && (allUserNodes[nodeId].changed || !allUserNodes[nodeId].isStudied)))
//       ) {
//         return { ...allNodes[nodeId], id: nodeId };
//       }
//     });
//     displayableNs = displayableNs.filter((dN) => dN);
//     displayableNs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
//     setBookmarks(displayableNs);
//   }, [lastIndex, allNodes, allUserNodes]);

//   const openBookmarkedNode = useCallback(
//     (nodeId) => (event) => {
//       props.openLinkedNode(nodeId);
//     },
//     [props.openLinkedNode]
//   );

//   const loadOlderNotificationsClick = useCallback(
//     () =>
//       setLastIndex((oldLastIndex) => {
//         if (lastIndex < Object.keys(allNodes).length) {
//           return oldLastIndex + 13;
//         }
//         return oldLastIndex;
//       }),
//     [allNodes]
//   );

//   return (
//     <>
//       {bookmarks.slice(0, lastIndex).map((node) => (
//         <li
//           className="CollapsedProposal collection-item"
//           key={`node${node.id}`}
//           onClick={openBookmarkedNode(node.id)}
//         >
//           <div className="SidebarNodeTypeIcon">
//             <NodeTypeIcon nodeType={node.nodeType} />
//             <div className="right">
//               <MetaButton
//               // tooltip="Creation or the last update of this node."
//               // tooltipPosition="TopLeft"
//               >
//                 {/* <i className="material-icons grey-text">event_available</i>{" "} */}
//                 <i className="material-icons grey-text">create</i>
//                 {dayjs(node.changedAt).fromNow()}
//                 {/* </MetaButton>
//               <MetaButton
//                 tooltip="# of improvement/child proposals on this node."
//                 tooltipPosition="BottomLeft"
//               > */}
//                 {/* <span>{shortenNumber(node.versions, 2, false)}</span> */}
//               </MetaButton>
//               <MetaButton
//               // tooltip="# of 1Cademists who have found this node unhelpful."
//               // tooltipPosition="TopLeft"
//               >
//                 <i className="material-icons grey-text">close</i>
//                 <span>{shortenNumber(node.wrongs, 2, false)}</span>
//               </MetaButton>
//               <MetaButton
//               // tooltip="# of 1Cademists who have found this node helpful."
//               // tooltipPosition="TopLeft"
//               >
//                 <i className="material-icons DoneIcon grey-text">done</i>
//                 <span>{shortenNumber(node.corrects, 2, false)}</span>
//               </MetaButton>
//             </div>
//           </div>
//           <div className="SearchResultTitle">
//             <HyperEditor readOnly={true} onChange={doNothing} content={node.title} />
//           </div>
//         </li>
//       ))}
//       {bookmarks.length > lastIndex && (
//         <div id="ContinueButton">
//           <MetaButton
//             onClick={loadOlderNotificationsClick}
//             // tooltip={"Load older " + (props.updates ? "updated" : "studied") + " bookmarks."}
//             // tooltipPosition="Right"
//           >
//             <i className="material-icons grey-text">expand_more</i> Older Bookmarks{" "}
//             <i className="material-icons grey-text">expand_more</i>
//           </MetaButton>
//         </div>
//       )}
//     </>
//   );
// };

// export default React.memo(BookmarksList);
