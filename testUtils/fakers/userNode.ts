import { faker } from "@faker-js/faker";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";

import { INodeChanges, IUserNode } from "../../src/types/IUserNode";
import { IUserNodeLog } from "../../src/types/IUserNodeLog";

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

type IFakeUserNodeLogOptions = {
  documentId?: string;
  userNode?: IUserNode;
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

export function createUserNodeLog(params: IFakeUserNodeLogOptions): IUserNodeLog {
  const { documentId, userNode } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    changed: !!Object.keys(userNode?.nodeChanges || {}).length,
    open: !!userNode?.open,
    correct: !!userNode?.correct,
    wrong: !!userNode?.wrong,
    user: userNode ? userNode.user : faker.internet.userName(),
    node: userNode ? userNode.node : faker.datatype.uuid(),
    isStudied: !!userNode?.isStudied,
    visible: !!userNode?.visible,
    isAdmin: false, // removed
    deleted: false,
    bookmarked: !!userNode?.bookmarked,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
