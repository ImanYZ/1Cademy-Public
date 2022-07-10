import { NodeType } from "src/knowledgeTypes";

export const NODE_TYPE_OPTIONS: NodeType[] = [
  NodeType.Advertisement,
  NodeType.Code,
  NodeType.Concept,
  NodeType.Idea,
  NodeType.News,
  NodeType.Private,
  NodeType.Profile,
  NodeType.Question,
  NodeType.Reference,
  NodeType.Relation,
  NodeType.Sequel,
  NodeType.Tag
];

export const RE_EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/im;
