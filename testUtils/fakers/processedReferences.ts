import { faker } from "@faker-js/faker";
import { IProcessedReference } from "src/types/IProcessedReference";

type IFakeInstitutionOptions = {
  documentId?: string;
  data: any;
};

export function createProcessedReference(params: IFakeInstitutionOptions): IProcessedReference {
  const { documentId, data } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    title: faker.company.name(),
    data: data ? data : [],
  };
}

export function convertIProcessedReferenceToTypeSchema(processedReference: IProcessedReference) {
  return {
    id: String(processedReference.documentId),
    title: String(processedReference.title),
    data: processedReference.data,
  };
}
