// import React from "react";

// import { ClusterNodes } from "../../nodeBookTypes";

// import { ClusterNodes } from "../../noteBookTypes";

// import { compareClusters } from "./MapUtils";

// type ClustersListProps = {
//   clusterNodes: ClusterNodes;
// };

// const ClustersList = ({ clusterNodes }: ClustersListProps) => {
//   return (
//     <>
//       {Object.keys(clusterNodes).map(cId => {
//         return (
//           <div
//             key={"Cluster" + cId}
//             className="ClusterSection"
//             style={{
//               top: clusterNodes[cId].y - 22 + "px",
//               left: clusterNodes[cId].x - 22 + "px",
//               width: clusterNodes[cId].width + 40 + "px",
//               height: clusterNodes[cId].height + 40 + "px",
//             }}
//           >
//             <p>{clusterNodes[cId].title}</p>
//           </div>
//         );
//       })}
//     </>
//   );
// };

// export default React.memo(ClustersList);
// export default React.memo(ClustersList, (prevProps, nextProps) =>
//   compareClusters(prevProps.clusterNodes, nextProps.clusterNodes)
// );

import React from "react";

export const ClustersList = () => {
  return <div>ClustersList</div>;
};
