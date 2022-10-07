import HttpMock from "node-mocks-http";

import nodeDataHandler from "../../../src/pages/api/nodeData";
import { createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";
describe("GET /api/nodeData", () => {
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

  const collects = [usersCollection, nodesCollection];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to get node data from nodeData api with specific node id", async () => {
    const req: any = HttpMock.createRequest({
      method: "POST",
      body: { nodeId: nodes[0].documentId },
    });
    const res: any = HttpMock.createResponse();
    await nodeDataHandler(req, res);
    const { results } = JSON.parse(res._getData());
    expect(results).toMatchObject({ id: nodes[0].documentId });
  });
});
