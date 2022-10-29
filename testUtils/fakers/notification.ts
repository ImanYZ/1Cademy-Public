import { faker } from "@faker-js/faker";

import { INode } from "../../src/types/INode";
import { INotification, INotificationAType, INotificationNum,INotificationOType } from "../../src/types/INotification";
import { IUser } from "../../src/types/IUser";

type IFakeNotificationOptions = {
  documentId?: string;
  oType?: INotificationOType;
  aType?: INotificationAType;
  node?: INode;
  user?: IUser;
  proposer?: IUser;
  checked?: boolean;
};

type IFakeNotificationNumOptions = {
  documentId?: string;
  notifications?: INotification[];
};

export function createNotification(params: IFakeNotificationOptions): INotification {
  const { documentId, oType, aType, user, proposer, node, checked } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    chooseUname: user ? user.chooseUname : false,
    proposer: proposer ? proposer.uname : faker.internet.userName(),
    checked: checked ? checked : false,
    title: faker.hacker.phrase(), // only 25 of 10865 has it (prod)
    fullname: user ? `${user.fName} ${user.lName}` : faker.hacker.noun(),
    nodeId: node ? String(node.documentId) : faker.datatype.uuid(),
    uname: user ? user.uname : faker.internet.userName(),
    imageUrl: user ? user.imageUrl : faker.image.imageUrl(),
    aType: aType ? aType : ("Accepted" as INotificationAType),
    oType: oType ? oType : ("Node" as INotificationOType),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createNotificationNum(params: IFakeNotificationNumOptions): INotificationNum {
  const { documentId, notifications } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    nNum: notifications ? notifications.length : 0,
  };
}
