import { faker } from "@faker-js/faker";
import { ICredit } from "src/types/ICredit";
import { INode } from "src/types/INode";

export type IFakeCreditOptions = {
  documentId?: string;
  tag?: INode;
  credits?: number;
};

export function createCredit(params: IFakeCreditOptions): ICredit {
  const { documentId, tag, credits } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    tag: tag ? tag.title : faker.datatype.string(30),
    tagId: tag ? String(tag.documentId) : faker.datatype.uuid(),
    meanA: 0,
    meanAInst: 0,
    deepA: 0,
    deepAInst: 0,
    iInstValue: 0,
    iValue: 0,
    ltermA: 0,
    ltermMaxDay: 0,
    credits: credits ? credits : 0,
    createdAt: new Date(),
  };
}
