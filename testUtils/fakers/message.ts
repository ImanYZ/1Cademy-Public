import { faker } from "@faker-js/faker";
import { IMessage } from "src/types/IMessage";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";

export type IFakeIMessageOptions = {
  documentId?: string;
  tag?: INode;
  user?: IUser;
  storageUri?: string;
  uploadedUri?: string;
  content?: string;
  node?: INode;
};

export function createMessage(params: IFakeIMessageOptions): IMessage {
  const { documentId, tag, user, storageUri, uploadedUri, content, node } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    uid: faker.datatype.uuid(),
    username: user ? user.uname : faker.internet.userName(),
    updatedAt: new Date(),
    imageUrl: user ? user.imageUrl : faker.image.imageUrl(),
    timestamp: new Date(),
    tagId: tag ? String(tag.documentId) : faker.datatype.uuid(),
    tag: tag ? tag.title : faker.company.name(),
    chooseUname: user ? user.chooseUname : false,
    storageUri: storageUri ? storageUri : "",
    uploadedUrl: uploadedUri ? uploadedUri : "",
    fullname: user ? `${user.fName} ${user.lName}` : faker.company.name(),
    content: content ? content : "",
    nodeLink: node ? String(node.documentId) : faker.datatype.uuid(),
    nodeTitle: node ? node.title : faker.hacker.phrase(),
  };
}
