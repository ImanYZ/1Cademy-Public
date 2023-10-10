import { INodeType } from "./INodeType";

export type INodeLink = {
  node: string;
  title: string;
  nodeType?: INodeType; // it was missing in version docs but, present in every node
  type?: INodeType; // it was missing in version docs but, present in every node
  label?: string;
  visible?: boolean /* TODO: this prop will be removed in future */;
};
