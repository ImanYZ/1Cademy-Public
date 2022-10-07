import HttpMock from "node-mocks-http";
import { TypesenseMock } from "testUtils/typesenseMocks";
import NodeTSSchema from "testUtils/typesenseMocks/nodes.schema";

import searchNodesHandler from "../../../src/pages/api/searchNodes";
import { convertNodeToTypeSchema, createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("GET /api/searchNodes", () => {
  const users = [getDefaultUser({}), createUser({})];
  const nodes: any = [
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
    nodes.map((node: any) => convertNodeToTypeSchema(node)),
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

  it("Should be able to search data from searchNodes api with params", async () => {
    let nodeData = nodes[0];
    let institutions: any = [];
    let contributors: any = [];
    Object.keys(nodeData.institutions).map(key => {
      institutions.push(key);
    });
    Object.keys(nodeData.contributors).map(key => {
      contributors.push(key);
    });
    let title = nodeData.title;
    const req: any = HttpMock.createRequest({
      method: "GET",
    });

    req.query["q"] = title;
    req.query["tags"] = nodeData.tags;
    req.query["institutions"] = institutions;
    req.query["upvotes"] = false;
    req.query["mostRecent"] = false;
    req.query["contributors"] = contributors;
    req.query["nodeTypes"] = [nodeData.nodeType];
    const res: any = HttpMock.createResponse();
    await searchNodesHandler(req, res);
    const { data } = JSON.parse(res._getData());
    data.map((result: any) => {
      expect(true).toBe(result.title.includes(title.substr(0, 5)));
      expect(result.nodeType).toEqual(nodeData.nodeType);
      expect(true).toBe(
        result.contributors.filter((contributor: any) => contributor.username == contributors[0]).length > 0
      );
    });
  });
});
