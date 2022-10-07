import HttpMock from "node-mocks-http";
import { TypesenseMock } from "testUtils/typesenseMocks";
import UserTSSchema from "testUtils/typesenseMocks/users.schema";

import contributorsAutocompleteHandler from "../../../src/pages/api/contributorsAutocomplete";
import { createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { convertUserToTypeSchema, createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";
describe("GET /api/contributorsAutocomplete", () => {
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
  const nodesTSCollection = new TypesenseMock(
    UserTSSchema,
    users.map(user => convertUserToTypeSchema(user)),
    "users"
  );
  const collects = [usersCollection, nodesCollection, nodesTSCollection];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to get search data from contributorsAutocomplete api with specific name", async () => {
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    let name = `${users[0].fName} ${users[0].lName}`;
    req.query["q"] = name;
    const res: any = HttpMock.createResponse();
    await contributorsAutocompleteHandler(req, res);
    const { results } = JSON.parse(res._getData());
    results.map((result: any) => {
      expect(result).toMatchObject({ name: name });
    });
  });

  it("Should be able to get search data from contributorsAutocomplete api with default data", async () => {
    const defaultContributors =
      process.env.NODE_ENV === "production"
        ? require("@/lib/datasets/defaultContributors.prod.json")
        : require("@/lib/datasets/defaultContributors.dev.json");
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    const res: any = HttpMock.createResponse();
    await contributorsAutocompleteHandler(req, res);
    const { results } = JSON.parse(res._getData());
    results.map((result: any, index: number) => {
      expect(result).toMatchObject(defaultContributors[index]);
    });
  });
});
