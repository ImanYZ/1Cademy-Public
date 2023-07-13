import { Node } from "src/nodeBookTypes";
import { NodeType, SimpleNode2 } from "src/types";

export const mapNodeToSimpleNode = (cur: Node, username: string): SimpleNode2 => ({
  id: cur.id,
  title: cur.title ?? "",
  changedAt: cur.changedAt.toDate().toISOString(),
  content: cur.content ?? "",
  nodeType: cur.nodeType as NodeType,
  nodeImage: cur.nodeImage || "",
  nodeVideo: cur.nodeVideo || "",
  corrects: cur.corrects ?? 0,
  wrongs: cur.wrongs ?? 0,
  tags: cur.tags,
  contributors: Object.keys(cur.contributors || {}).map(key => ({
    fullName: cur.contributors[key].fullname,
    imageUrl: cur.contributors[key].imageUrl,
    username: username,
  })),
  institutions: Object.entries(cur.institutions || {})
    .map(cur => ({ name: cur[0], reputation: cur[1].reputation || 0 }))
    .sort((a, b) => b.reputation - a.reputation)
    .map(institution => ({ name: institution.name })),
  choices: cur.choices || [],
  versions: cur.versions ?? 0,
});
