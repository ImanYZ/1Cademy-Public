import { useTheme } from "@mui/material";
import React from "react";

import { compareEdgeIds, compareEdges } from "../../lib/utils/Map.utils";
import Line from "./Line/Line";

type LinkListProps = {
  edgeIds: string[];
  edges: any;
  selectedRelation: string | null;
};

export const LinksList = ({ edgeIds, edges }: LinkListProps) => {
  const theme = useTheme();
  return (
    <>
      {edgeIds.map(eId => {
        return (
          <Line
            key={eId}
            label={edges[eId].label}
            from={{ x: edges[eId].fromX, y: edges[eId].fromY - 1 }}
            to={{ x: edges[eId].toX, y: edges[eId].toY - 1 }}
            color={theme.palette.mode === "dark" ? "#01d36a" : "#1CAC44"}
          />
        );
      })}
    </>
  );
};

export const MemoizedLinksList = React.memo(LinksList, (prev, next) => {
  return (
    compareEdgeIds(prev.edgeIds, next.edgeIds) && compareEdges(prev.edges, next.edges)
    // prev.edges.fromX === next.edges.fromX &&
    // prev.edges.fromY === next.edges.fromY &&
    // prev.edges.toX === next.edges.toX &&
    // prev.edges.toY === next.edges.toY
  ); /*&& compareEdges(prev.edges, next.edges);*/
});

// import React from "react";

// import Line from "./Line/Line";

// // import { compareEdgeIds, compareEdges } from "./MapUtils";

// const LinksList = ({ edgeIds, edges, selectedRelation }) => {
//   return edgeIds.map((eId) => {
//     return (
//       <Line
//         key={eId}
//         identifier={eId}
//         label={edges[eId].label}
//         selected={selectedRelation === eId}
//         from={{ x: edges[eId].fromX, y: edges[eId].fromY - 1 }}
//         to={{ x: edges[eId].toX, y: edges[eId].toY - 1 }}
//         borderBottomStyle="2.5px solid"
//         color="#01d36a"
//       />
//     );
//   });
// };

// export default React.memo(LinksList);
// // export default React.memo(LinksList,
// //   (prevProps, nextProps) =>
// //     compareEdgeIds(prevProps.edgeIds, nextProps.edgeIds) &&
// //     compareEdges(prevProps.edges, nextProps.edges) &&
// //     prevProps.selectedRelation === nextProps.selectedRelation
// // );
