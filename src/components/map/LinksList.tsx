import React from 'react'

import Line from './Line/Line'

type LinkListProps = {
  edgeIds: string[],
  edges: any,
  selectedRelation: string | null,
}

export const LinksList = ({ edgeIds, edges, selectedRelation }: LinkListProps) => {
  return <>
    {edgeIds.map((eId) => {
      return (
        <Line
          key={eId}
          label={edges[eId].label}
          from={{ x: edges[eId].fromX, y: edges[eId].fromY - 1 }}
          to={{ x: edges[eId].toX, y: edges[eId].toY - 1 }}
          color="#01d36a"
        />
      )
    })}
  </>
}

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
