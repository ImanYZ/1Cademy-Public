import HttpMock from "node-mocks-http";

import getSelectedInstitutionsHandler from "../../../src/pages/api/getSelectedInstitutions";
import { createInstitution } from "../../../testUtils/fakers/institution";
import { MockData } from "../../../testUtils/mockCollections";
describe("GET /api/getSelectedInstitutions", () => {
  const institutions = [createInstitution({})];
  const institutionsCollection = new MockData(institutions, "institutions");

  const collects = [institutionsCollection];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to get search data from getSelectedInstitutions api with specific name", async () => {
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    let id = institutions[0].documentId;
    req.query.institutions = [id];
    const res: any = HttpMock.createResponse();
    await getSelectedInstitutionsHandler(req, res);
    const results = JSON.parse(res._getData());
    expect(results[0]).toMatchObject({
      id: institutions[0].documentId,
      imageUrl: institutions[0].logoURL,
      name: institutions[0].name,
    });
  });
});
