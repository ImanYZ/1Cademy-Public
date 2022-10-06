import { faker } from "@faker-js/faker";
import { IInstitution } from "src/types/IInstitution";

type IFakeInstitutionOptions = {
  documentId?: string;
};

export function createInstitution(params: IFakeInstitutionOptions): IInstitution {
  const { documentId } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    name: faker.company.name(),
    domains: [faker.internet.domainName()],
    logoURL: faker.image.imageUrl(),
    lat: parseFloat(faker.address.latitude()),
    lng: parseFloat(faker.address.longitude()),
    usersNum: 0,
    users: [],
    country: faker.address.country(),
    totalPoints: 0,
  };
}

export function convertInstitutionToTypeSchema(institute: IInstitution) {
  return {
    id: String(institute.documentId),
    name: institute.name,
  };
}
