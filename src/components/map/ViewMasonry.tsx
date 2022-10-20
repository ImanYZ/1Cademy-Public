import { Masonry } from "@mui/lab";
import React, { useEffect, useState } from "react";
import { SimpleNode } from "src/knowledgeTypes";
import { FullNodesData } from "src/nodeBookTypes";

import { NodeItem } from "../NodeItem";

type ViewMasonryProps = {
  nodes: FullNodesData;
  hideNodeHandler: any;
  userId?: string | null;
};
export const ViewMasonry = ({ nodes, hideNodeHandler, userId }: ViewMasonryProps) => {
  const [simpleNodes, setSimpleNodes] = useState<SimpleNode[]>([]);

  useEffect(() => {
    const tmpSimpleNodes = Object.keys(nodes)
      .map(key => nodes[key])
      .map(fullNode => {
        console.log("fullNode", fullNode);
        const simpleNode: SimpleNode = {
          id: fullNode.node,
          choices: fullNode.choices,
          contributors: Object.keys(fullNode.contributors).map(key => ({
            fullName: fullNode.contributors[key].fullname,
            imageUrl: fullNode.contributors[key].imageUrl,
            username: key,
          })),
          institutions: Object.keys(fullNode.institutions).map(key => ({ name: key })),
          nodeType: fullNode.nodeType,
          tags: fullNode.tags,
          versions: fullNode.versions ?? 0,
          changedAt: fullNode.changedAt.toString(),
          content: fullNode.content,
          corrects: fullNode.corrects,
          nodeImage: fullNode.nodeImage,
          studied: fullNode.isStudied,
          title: fullNode.title,
          wrongs: fullNode.wrongs,
        };
        return simpleNode;
      });
    setSimpleNodes(tmpSimpleNodes);
  }, [nodes]);

  return (
    <Masonry sx={{ my: 4, mx: { md: "0px" } }} columns={{ xm: 1, md: 2 }} spacing={4} defaultHeight={450}>
      {simpleNodes.map((simpleNode: SimpleNode) => (
        <NodeItem
          key={simpleNode.id}
          node={simpleNode}
          userId={userId}
          identifier={simpleNode.id}
          onHideNode={hideNodeHandler}
        />
      ))}
    </Masonry>
  );
};
