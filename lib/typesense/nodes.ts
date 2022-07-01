import { LinkedKnowledgeNode, TypesenseNodesSchema } from "../../src/knowledgeTypes";

export const getNodeTags = (nodeData: TypesenseNodesSchema): LinkedKnowledgeNode[] => {
  const tags: { node: string; title?: string }[] = [];
  if (nodeData.tagIds) {
    for (let tagIdx = 0; tagIdx < nodeData.tagIds.length; tagIdx++) {
      tags.push({
        node: nodeData.tagIds[tagIdx],
        title: (nodeData.tags as string[])[tagIdx]
      });
    }
  } else {
    const tagsField = nodeData.tags as {
      node: string;
      title?: string;
    }[];
    for (let tag of tagsField) {
      if (tag.node && tag.title) {
        tags.push({
          node: tag.node,
          title: tag.title
        });
      }
    }
  }
  return tags;
};