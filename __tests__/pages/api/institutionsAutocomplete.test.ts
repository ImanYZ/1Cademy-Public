import HttpMock from "node-mocks-http";
import { TypesenseMock } from "testUtils/typesenseMocks";
import InstituteTSSchema from "testUtils/typesenseMocks/institutions.schema";

import institutionsAutocompleteHandler from "../../../src/pages/api/institutionsAutocomplete";
import { convertInstitutionToTypeSchema, createInstitution } from "../../../testUtils/fakers/institution";
import { createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";
describe("GET /api/institutionsAutocomplete", () => {
  const users = [getDefaultUser({}), createUser({})];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];
  nodes.push(
    createNode({
      admin: users[0],
      tags: [nodes[0]],
      corrects: 1,
    })
  );

  const institutions = [createInstitution({})];
  const institutionsCollection = new MockData(institutions, "institutions");
  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const institutionsTSCollection = new TypesenseMock(
    InstituteTSSchema,
    institutions.map(node => convertInstitutionToTypeSchema(node)),
    "institutions"
  );
  const collects = [usersCollection, nodesCollection, institutionsCollection, institutionsTSCollection];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to get search data from institutionsAutocomplete api with specific name", async () => {
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    let name = institutions[0].name;
    req.query["q"] = name;
    const res: any = HttpMock.createResponse();
    await institutionsAutocompleteHandler(req, res);
    const { results } = JSON.parse(res._getData());
    results.map((result: any) => {
      expect(result).toMatchObject({ name: name });
    });
  });

  it("Should be able to get search data from institutionsAutocomplete api with default data", async () => {
    const defaultInstitutions =
      process.env.NODE_ENV === "production"
        ? require("@/lib/datasets/defaultInstitutions.prod.json")
        : require("@/lib/datasets/defaultInstitutions.dev.json");
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    const res: any = HttpMock.createResponse();
    await institutionsAutocompleteHandler(req, res);
    const { results } = JSON.parse(res._getData());
    results.map((result: any, index: number) => {
      expect(result).toMatchObject(defaultInstitutions[index]);
    });
  });
});
