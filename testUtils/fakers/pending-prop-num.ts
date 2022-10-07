import { faker } from "@faker-js/faker";
import { INode } from "src/types/INode";
import { IPendingPropNum } from "src/types/IPendingPropNum";
import { IUser } from "src/types/IUser";

type IFakePendingPropNumOptions = {
  documentId?: string;
  user?: IUser;
  tag?: INode;
  pNum?: number;
};

export function createPendingPropNum(params: IFakePendingPropNumOptions): IPendingPropNum {
  const { documentId, tag, user, pNum } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    tagId: tag ? String(tag.documentId) : faker.datatype.uuid(),
    pNum: pNum ? pNum : 0,
    uname: user ? user.uname : faker.internet.userName(),
  };
}
