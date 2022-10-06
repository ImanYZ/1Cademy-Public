import HttpMock from "node-mocks-http";

import { db } from "../../../src/lib/firestoreServer/admin";
import institutionsAutocompleteHandler from "../../../src/pages/api/institutionsAutocomplete";
import { createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { institutionsData,MockData } from "../../../testUtils/mockCollections";
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

  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const collects = [usersCollection, nodesCollection, institutionsData];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to get search institutionsAutocomplete with specific name", async () => {
    let institutionDoc: any = await db.collection("institutions").limit(1).get();
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    let name = institutionDoc.docs[0].data().name;
    req.query["q"] = name;
    const res: any = HttpMock.createResponse();
    await institutionsAutocompleteHandler(req, res);
    const { results } = JSON.parse(res._getData());
    results.map((result: any) => {
      expect(result).toMatchObject({ name: name });
    });
  });

  it("Should be able to get search institutionsAutocomplete with default data", async () => {
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
