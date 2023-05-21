import { Node } from "../nodeBookTypes";

export const nodeToNarration = (node: Node): string => `${node.title}. ${node.content}`;
