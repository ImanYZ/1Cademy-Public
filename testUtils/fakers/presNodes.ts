import { faker } from "@faker-js/faker";
import { INode } from "src/types/INode";
import { IPresentation } from "src/types/IPresentation";
import { IPresNode } from "src/types/IPresNode";
import { IUser } from "src/types/IUser";

type IFakePresNodeOptions = {
  documentId?: string;
  user?: IUser;
  node?: INode;
  presentation?: IPresentation;
};

export function createPresNode(params: IFakePresNodeOptions): IPresNode {
  const { documentId, node, user, presentation } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    seconds: 10,
    nodeId: node ? String(node.documentId) : faker.datatype.uuid(),
    uname: user ? String(user.uname) : faker.internet.userName(),
    presId: presentation ? String(presentation.documentId) : faker.datatype.uuid(),
    deleted: false,
    createdAt: new Date(),
  };
}
