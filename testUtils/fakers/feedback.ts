import { faker } from "@faker-js/faker";
import { IFeedback } from "src/types/IFeedback";

export type IFeedbackOptions = {
  documentId?: string;
};

export function createFeedback(params: IFeedbackOptions): IFeedback {
  const { documentId } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    name: faker.hacker.noun(),
    email: faker.internet.email(),
    feedback: faker.hacker.phrase(),
    pageURL: faker.internet.url(),
    createdAt: new Date(),
  };
}
