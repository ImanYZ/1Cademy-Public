import HttpMock from "node-mocks-http";
import { TypesenseMock } from "testUtils/typesenseMocks";
import NodeTSSchema from "testUtils/typesenseMocks/nodes.schema";

import fullNodeAutocompleteHandler from "../../../src/pages/api/fullNodeAutocomplete";
import { convertNodeToTypeSchema, createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("GET /api/fullNodeAutocomplete", () => {
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
    NodeTSSchema,
    nodes.map((node, index) => convertNodeToTypeSchema(node, { mostHelpful: index })),
    "nodes"
  );
  const collects = [usersCollection, nodesCollection, nodesTSCollection];
  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to search nodes with isTag true with specific title", async () => {
    let title = nodes[0].title;
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    req.query["q"] = title;
    const res: any = HttpMock.createResponse();
    await fullNodeAutocompleteHandler(req, res);
    const { results } = JSON.parse(res._getData());
    results.map((result: any) => {
      expect(true).toBe(result.title.includes(title));
    });
  });
});
