import { faker } from "@faker-js/faker";
import { INode } from "src/types/INode";
import { IPresentation } from "src/types/IPresentation";
import { IUser } from "src/types/IUser";

type IFakePresentationOptions = {
  documentId?: string;
  user?: IUser;
  tag?: INode;
};

export function createPresentation(params: IFakePresentationOptions): IPresentation {
  const { documentId, tag, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    tagId: tag ? String(tag.documentId) : faker.datatype.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    tag: tag ? tag.title : faker.hacker.phrase(),
    imageUrl: user ? user.imageUrl : faker.image.imageUrl(),
    title: faker.hacker.phrase(),
    fullname: user ? `${user.fName} ${user.lName}` : faker.hacker.phrase(),
    deleted: false,
    chooseUname: user ? user.chooseUname : false,
    uname: user ? user.uname : faker.internet.userName(),
    duration: 100,
    audioUrl: faker.image.imageUrl(),
  };
}
