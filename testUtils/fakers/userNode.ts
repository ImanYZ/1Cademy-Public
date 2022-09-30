import { faker } from "@faker-js/faker";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";

import { INodeChanges, IUserNode } from "../../src/types/IUserNode";

type IFakeUserNodeOptions = {
  documentId?: string;
  nodeChanges?: INodeChanges;
  bookmarked?: boolean;
  isStudied?: boolean;
  correct?: boolean;
  wrong?: boolean;
  visible?: boolean;
  changed?: boolean;
  open?: boolean;
  user?: IUser;
  node?: INode;
};

export function createUserNode(params: IFakeUserNodeOptions): IUserNode {
  const { nodeChanges, bookmarked, isStudied, wrong, correct, visible, user, node, open, changed } = params;
  return {
    documentId: params.documentId ? params.documentId : faker.datatype.uuid(),
    changed: typeof changed !== "undefined" ? changed : false,
    open: typeof open !== "undefined" ? open : false,
    deleted: false,
    node: typeof node !== "undefined" ? String(node.documentId) : faker.datatype.uuid(),
    user: typeof user !== "undefined" ? user.uname : faker.hacker.noun(),
    visible: typeof visible !== "undefined" ? visible : false,
    correct: typeof correct !== "undefined" ? correct : false,
    wrong: typeof wrong !== "undefined" ? wrong : false,
    isStudied: typeof isStudied !== "undefined" ? isStudied : false,
    bookmarked: typeof bookmarked !== "undefined" ? bookmarked : false,
    nodeChanges: nodeChanges ? nodeChanges : {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
